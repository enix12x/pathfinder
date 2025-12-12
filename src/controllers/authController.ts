import { Request, Response } from 'express';
import axios from 'axios';
import { loadConfig } from '../config';

export class AuthController {
  static async loginPage(req: Request, res: Response) {
    const config = loadConfig();
    if (!config.auth.enabled) {
      return res.redirect('/');
    }
    res.render('login', { 
      error: null,
      message: null,
      branding: {
        title: config.Branding?.Title || 'Pathfinder',
        subtitle: config.Branding?.Subtitle || 'Your navigation hub'
      }
    });
  }

  static async accountSettingsPage(req: Request, res: Response) {
    const config = loadConfig();
    res.render('account-settings', {
      branding: {
        title: config.Branding?.Title || 'Pathfinder',
        subtitle: config.Branding?.Subtitle || 'Your navigation hub'
      }
    });
  }

  static async registerPage(req: Request, res: Response) {
    const config = loadConfig();
    if (!config.auth.enabled) {
      return res.redirect('/');
    }
    res.render('register', { 
      error: null,
      message: null,
      branding: {
        title: config.Branding?.Title || 'Pathfinder',
        subtitle: config.Branding?.Subtitle || 'Your navigation hub'
      }
    });
  }

  static async register(req: Request, res: Response) {
    try {
      const config = loadConfig();
      const { email, password } = req.body;

      const response = await axios.post(`${config.auth.authServerUrl}/api/auth/register`, {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Check if verification is required
        if (response.data.requiresVerification) {
          // User needs verification - redirect to login with message
          const config = loadConfig();
          res.render('login', { 
            error: null,
            message: 'Registration successful! Please wait for admin verification before logging in.',
            branding: {
              title: config.Branding?.Title || 'Pathfinder',
              subtitle: config.Branding?.Subtitle || 'Your navigation hub'
            }
          });
          return;
        }
        
        // Set cookie from response
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          cookies.forEach((cookie: string) => {
            if (cookie.startsWith('token=')) {
              res.setHeader('Set-Cookie', cookie);
            }
          });
        }
        res.redirect('/');
      } else {
        const config = loadConfig();
        res.render('register', { 
          error: 'Registration failed',
          message: null,
          branding: {
            title: config.Branding?.Title || 'Pathfinder',
            subtitle: config.Branding?.Subtitle || 'Your navigation hub'
          }
        });
      }
    } catch (error: any) {
      const config = loadConfig();
      res.render('register', { 
        error: error.response?.data?.error || 'Registration failed',
        message: null,
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        }
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const config = loadConfig();
      const { email, password } = req.body;

      const response = await axios.post(`${config.auth.authServerUrl}/api/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        // Set cookie from response
        const cookies = response.headers['set-cookie'];
        if (cookies) {
          cookies.forEach((cookie: string) => {
            if (cookie.startsWith('token=')) {
              res.setHeader('Set-Cookie', cookie);
            }
          });
        }
        res.redirect('/');
      } else {
        const config = loadConfig();
        res.render('login', { 
          error: 'Invalid credentials',
          message: null,
          branding: {
            title: config.Branding?.Title || 'Pathfinder',
            subtitle: config.Branding?.Subtitle || 'Your navigation hub'
          }
        });
      }
    } catch (error: any) {
      const config = loadConfig();
      res.render('login', { 
        error: error.response?.data?.error || 'Login failed',
        message: null,
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        }
      });
    }
  }

  static async logout(req: Request, res: Response) {
    const config = loadConfig();
    try {
      await axios.post(`${config.auth.authServerUrl}/api/auth/logout`, {}, {
        headers: {
          Cookie: req.headers.cookie || ''
        },
        withCredentials: true
      });
    } catch (error) {
      // Ignore errors
    }
    res.clearCookie('token');
    res.redirect('/login');
  }

  static async changePasswordPage(req: Request, res: Response) {
    const config = loadConfig();
    res.render('change-password', { 
      error: null, 
      success: null,
      branding: {
        title: config.Branding?.Title || 'Pathfinder',
        subtitle: config.Branding?.Subtitle || 'Your navigation hub'
      }
    });
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const config = loadConfig();
      const { currentPassword, newPassword } = req.body;

      await axios.post(`${config.auth.authServerUrl}/api/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Cookie: req.headers.cookie || ''
        },
        withCredentials: true
      });

      res.render('change-password', { 
        error: null, 
        success: 'Password changed successfully',
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        }
      });
    } catch (error: any) {
      const config = loadConfig();
      res.render('change-password', {
        error: error.response?.data?.error || 'Failed to change password',
        success: null,
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        }
      });
    }
  }

  static async deleteAccount(req: Request, res: Response) {
    try {
      const config = loadConfig();
      await axios.post(`${config.auth.authServerUrl}/api/auth/delete-account`, {}, {
        headers: {
          Cookie: req.headers.cookie || ''
        },
        withCredentials: true
      });
      res.clearCookie('token');
      res.redirect('/login');
    } catch (error: any) {
      res.status(500).render('error', { error: 'Failed to delete account' });
    }
  }
}
