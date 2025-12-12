import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { loadConfig } from '../config';
import { buildMenuTreeFromTOML, MenuNode } from '../utils/menuBuilder';
import { LinkModel } from '../models/Link';
import { buildMenuTreeFromLinks } from '../utils/menuBuilder';

export class HomeController {
  static async index(req: AuthRequest, res: Response) {
    try {
      const config = loadConfig();
      let menuTree: MenuNode[] = [];

      if (config.auth.enabled) {
        // Load from database
        try {
          const userId = req.user?.id || null;
          const links = await LinkModel.getVisibleLinks(userId);
          menuTree = buildMenuTreeFromLinks(links);
        } catch (error: any) {
          console.error('Error loading links from database:', error.message);
          menuTree = [];
        }
      } else {
        // Load from TOML
        if (config.Menu?.Item) {
          menuTree = buildMenuTreeFromTOML(config.Menu.Item);
        }
      }

      res.render('index', {
        menuTree,
        user: req.user,
        authEnabled: config.auth.enabled,
        authServerUrl: config.auth.authServerUrl,
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        },
        adminPanelUrl: config.Admin?.PanelUrl
      });
    } catch (error: any) {
      res.status(500).render('error', { error: error.message });
    }
  }

  static async submenu(req: AuthRequest, res: Response) {
    try {
      const config = loadConfig();
      const submenuId = req.params.id;
      let menuTree: MenuNode[] = [];
      let parentItem: MenuNode | null = null;

      if (config.auth.enabled) {
        try {
          const userId = req.user?.id || null;
          const links = await LinkModel.getVisibleLinks(userId);
          const allItems = buildMenuTreeFromLinks(links);
          
          // Find the submenu item
          const findItem = (items: MenuNode[], id: string): MenuNode | null => {
            for (const item of items) {
              if (item.id === id) return item;
              if (item.children) {
                const found = findItem(item.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          
          parentItem = findItem(allItems, submenuId);
          if (parentItem && parentItem.children) {
            menuTree = parentItem.children;
          } else {
            menuTree = [];
          }
        } catch (error: any) {
          console.error('Error loading submenu from database:', error.message);
          menuTree = [];
        }
      } else {
        if (config.Menu?.Item) {
          const allItems = buildMenuTreeFromTOML(config.Menu.Item);
          
          const findItem = (items: MenuNode[], id: string): MenuNode | null => {
            for (const item of items) {
              if (item.id === id) return item;
              if (item.children) {
                const found = findItem(item.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          
          parentItem = findItem(allItems, submenuId);
          if (parentItem && parentItem.children) {
            menuTree = parentItem.children;
          } else {
            menuTree = [];
          }
        }
      }

      res.render('submenu', {
        menuTree,
        parentItem,
        user: req.user,
        authEnabled: config.auth.enabled,
        authServerUrl: config.auth.authServerUrl,
        branding: {
          title: config.Branding?.Title || 'Pathfinder',
          subtitle: config.Branding?.Subtitle || 'Your navigation hub'
        },
        adminPanelUrl: config.Admin?.PanelUrl
      });
    } catch (error: any) {
      res.status(500).render('error', { error: error.message });
    }
  }
}
