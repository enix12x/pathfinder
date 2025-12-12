import { MenuItem } from '../config';
import { Link } from '../models/Link';

export interface MenuNode {
  id: string;
  name: string;
  type: 'link' | 'submenu';
  url?: string;
  description?: string;
  password?: string;
  disclaimer?: string;
  children?: MenuNode[];
}

export function buildMenuTreeFromTOML(items: MenuItem[]): MenuNode[] {
  return items.map(item => {
    const node: MenuNode = {
      id: item.Id,
      name: item.Name,
      type: item.Type,
      url: item.Link,
      description: item.Description,
      password: item.Password,
      disclaimer: item.Disclaimer,
      children: undefined
    };

    if (item.Type === 'submenu' && item.Children) {
      node.children = buildMenuTreeFromTOML(item.Children);
    }

    return node;
  });
}

export function buildMenuTreeFromLinks(links: Link[], parentId: number | null = null): MenuNode[] {
  const children = links.filter(l => l.parentId === parentId);
  
  return children.map(link => {
    const node: MenuNode = {
      id: link.id.toString(),
      name: link.title,
      type: link.submenu ? 'submenu' : 'link',
      url: link.url || undefined,
      description: link.description || undefined,
      password: link.password || undefined,
      disclaimer: link.disclaimer || undefined,
      children: undefined
    };

    if (link.submenu) {
      node.children = buildMenuTreeFromLinks(links, link.id);
    }

    return node;
  });
}

