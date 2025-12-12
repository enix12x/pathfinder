import { Request, Response, NextFunction } from 'express';
import { loadConfig } from '../config';
import axios from 'axios';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const config = loadConfig();
    
    if (!config.auth.enabled) {
      return next();
    }

    const token = req.cookies?.token;
    
    if (!token) {
      return res.redirect('/login');
    }

    try {
      const response = await axios.get(`${config.auth.authServerUrl}/api/auth/verify`, {
        headers: {
          Cookie: `token=${token}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        req.user = {
          id: response.data.user.id,
          email: response.data.user.email,
          isAdmin: response.data.user.isAdmin
        };
        return next();
      }
    } catch (error) {
      // Token invalid or expired
    }

    res.redirect('/login');
  } catch (error) {
    res.redirect('/login');
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const config = loadConfig();
    
    if (!config.auth.enabled) {
      return next();
    }

    const token = req.cookies?.token;
    
    if (!token) {
      // If auth is enabled and no token, redirect to login
      return res.redirect('/login');
    }

    try {
      const response = await axios.get(`${config.auth.authServerUrl}/api/auth/verify`, {
        headers: {
          Cookie: `token=${token}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        req.user = {
          id: response.data.user.id,
          email: response.data.user.email,
          isAdmin: response.data.user.isAdmin
        };
      }
    } catch (error) {
      // Token invalid, continue without user
    }

    next();
  } catch (error) {
    next();
  }
}

