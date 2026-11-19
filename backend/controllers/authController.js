import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

// In-memory OTP storage with 5-minute lifespan
const otpStore = new Map();

// Helper to issue JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fintrack_secret_fallback', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generate and send 6-digit OTP for Login or Registration
 */
export const sendOtp = async (req, res, next) => {
  try {
    const { identifier, type = 'login' } = req.body;

    if (!identifier || identifier.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address or phone number.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();

    if (type === 'login') {
      // Check if user exists
      const [users] = await query(
        'SELECT id, full_name, email, phone, role FROM users WHERE LOWER(email) = ? OR REPLACE(phone, " ", "") = ?',
        [cleanIdentifier, cleanIdentifier.replace(/\s+/g, '')]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No registered bank account found with this email or phone number.',
        });
      }
    } else if (type === 'register') {
      // Check if email already taken
      const [existing] = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanIdentifier]);
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 5 minute expiration (300 seconds)
    otpStore.set(cleanIdentifier, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    console.log(`\n[FINTRACK SECURITY OTP] Generated OTP for [${cleanIdentifier}]: ${otp} (Type: ${type})\n`);

    res.status(200).json({
      success: true,
      message: `Security OTP sent successfully to ${identifier}`,
      otp, // Provided for live simulation and 1-click test fill
      expires_in_seconds: 300,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Validate OTP and authenticate user (for Login or Registration)
 */
export const verifyOtp = async (req, res, next) => {
  try {
    const { identifier, otp, type = 'login', registerData } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Both identifier and 6-digit OTP code are required.' });
    }

    const cleanIdentifier = identifier.toLowerCase().trim();
    const stored = otpStore.get(cleanIdentifier);

    // Verify OTP existence and expiration
    if (!stored || Date.now() > stored.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Security OTP has expired or was not requested. Please request a new code.',
      });
    }

    // Verify OTP match
    if (stored.otp.trim() !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and re-enter.',
      });
    }

    // Clear used OTP
    otpStore.delete(cleanIdentifier);

    // 1. Handle Login Verification
    if (type === 'login') {
      const [users] = await query(
        'SELECT * FROM users WHERE LOWER(email) = ? OR REPLACE(phone, " ", "") = ?',
        [cleanIdentifier, cleanIdentifier.replace(/\s+/g, '')]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, message: 'User record not found.' });
      }

      const user = users[0];
      const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ?', [user.id]);

      const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
      await query(
        'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
        [user.id, `${user.role.toUpperCase()}_OTP_LOGIN`, clientIp, `User ${user.email} authenticated via 2FA OTP.`]
      );

      const token = generateToken(user.id, user.role);

      return res.status(200).json({
        success: true,
        message: 'Two-Factor Authentication verified successfully!',
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          accounts: accounts || [],
        },
      });
    }

    // 2. Handle Registration Verification
    if (type === 'register') {
      if (!registerData || !registerData.full_name || !registerData.password) {
        return res.status(400).json({ success: false, message: 'Missing user registration details.' });
      }

      const { full_name, email, password, phone, address, role = 'customer' } = registerData;

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const [userResult] = await query(
        'INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
        [full_name, email.toLowerCase().trim(), password_hash, role, phone || '', address || '']
      );

      const userId = userResult.insertId;

      // Welcome Account with $1,000 bonus
      let accountNumber = null;
      if (role === 'customer') {
        accountNumber = `FT${Math.floor(100000 + Math.random() * 900000)}`;
        await query(
          'INSERT INTO accounts (user_id, account_number, account_type, balance, status) VALUES (?, ?, ?, ?, ?)',
          [userId, accountNumber, 'savings', 1000.00, 'active']
        );
      }

      const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
      await query(
        'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
        [userId, 'USER_REGISTRATION_VERIFIED_OTP', clientIp, `Registered and verified account for ${email}`]
      );

      const token = generateToken(userId, role);

      const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ?', [userId]);

      return res.status(201).json({
        success: true,
        message: 'Account verified and activated successfully!',
        token,
        user: {
          id: userId,
          full_name,
          email,
          role,
          phone,
          address,
          accounts: accounts || [],
        },
      });
    }

    return res.status(400).json({ success: false, message: 'Unsupported OTP action type.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Direct registration
 */
export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, phone, address, role = 'customer' } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
    }

    const [existingUsers] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [userResult] = await query(
      'INSERT INTO users (full_name, email, password_hash, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [full_name, email.toLowerCase().trim(), password_hash, role, phone || '', address || '']
    );

    const userId = userResult.insertId;

    let accountNumber = null;
    if (role === 'customer') {
      accountNumber = `FT${Math.floor(100000 + Math.random() * 900000)}`;
      await query(
        'INSERT INTO accounts (user_id, account_number, account_type, balance, status) VALUES (?, ?, ?, ?, ?)',
        [userId, accountNumber, 'savings', 1000.00, 'active']
      );
    }

    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [userId, 'USER_REGISTRATION', clientIp, `New ${role} registration: ${email}`]
    );

    const token = generateToken(userId, role);
    const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ?', [userId]);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: userId,
        full_name,
        email,
        role,
        phone,
        address,
        accounts: accounts || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token (Password method)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const [users] = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ?', [user.id]);

    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    await query(
      'INSERT INTO audit_logs (user_id, action, ip_address, details) VALUES (?, ?, ?, ?)',
      [user.id, user.role === 'admin' ? 'ADMIN_LOGIN' : 'CUSTOMER_LOGIN', clientIp, `User ${user.email} logged in`]
    );

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        accounts: accounts || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 */
export const getMe = async (req, res, next) => {
  try {
    const [accounts] = await query('SELECT * FROM accounts WHERE user_id = ?', [req.user.id]);
    res.status(200).json({
      success: true,
      user: {
        ...req.user,
        accounts: accounts || [],
      },
    });
  } catch (error) {
    next(error);
  }
};
