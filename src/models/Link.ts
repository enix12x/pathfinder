import { getPool } from '../database';

export interface Link {
  id: number;
  parentId: number | null;
  title: string;
  url: string | null;
  submenu: boolean;
  description: string | null;
  password: string | null;
  disclaimer: string | null;
  visibility: 'all' | 'specific';
  createdByUserId: number;
}

export interface LinkWithVisibility extends Link {
  visible: boolean;
}

export class LinkModel {
  static async create(data: {
    parentId: number | null;
    title: string;
    url: string | null;
    submenu: boolean;
    description: string | null;
    password: string | null;
    disclaimer: string | null;
    visibility: 'all' | 'specific';
    createdByUserId: number;
  }): Promise<Link> {
    const pool = await getPool();
    const [result] = await pool.execute(
      'INSERT INTO links (parentId, title, url, submenu, description, password, disclaimer, visibility, createdByUserId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [data.parentId, data.title, data.url, data.submenu, data.description, data.password, data.disclaimer, data.visibility, data.createdByUserId]
    );
    
    const insertId = (result as any).insertId;
    const link = await this.findById(insertId);
    if (!link) {
      throw new Error('Failed to create link');
    }
    return link;
  }

  static async findById(id: number): Promise<Link | null> {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM links WHERE id = ?', [id]);
    const links = rows as Link[];
    return links.length > 0 ? links[0] : null;
  }

  static async findByParentId(parentId: number | null): Promise<Link[]> {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM links WHERE parentId = ? ORDER BY title', [parentId]);
    return rows as Link[];
  }

  static async findAll(): Promise<Link[]> {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT * FROM links ORDER BY title');
    return rows as Link[];
  }

  static async update(id: number, data: Partial<Link>): Promise<void> {
    const pool = await getPool();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      values.push(data.url);
    }
    if (data.submenu !== undefined) {
      updates.push('submenu = ?');
      values.push(data.submenu);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.password !== undefined) {
      updates.push('password = ?');
      values.push(data.password);
    }
    if (data.disclaimer !== undefined) {
      updates.push('disclaimer = ?');
      values.push(data.disclaimer);
    }
    if (data.visibility !== undefined) {
      updates.push('visibility = ?');
      values.push(data.visibility);
    }

    if (updates.length > 0) {
      values.push(id);
      await pool.execute(`UPDATE links SET ${updates.join(', ')} WHERE id = ?`, values);
    }
  }

  static async delete(id: number): Promise<void> {
    const pool = await getPool();
    await pool.execute('DELETE FROM links WHERE id = ?', [id]);
  }

  static async getVisibleLinks(userId: number | null): Promise<Link[]> {
    const pool = await getPool();
    
    if (userId === null) {
      // No user - only show 'all' visibility links
      const [rows] = await pool.execute("SELECT * FROM links WHERE visibility = 'all' ORDER BY title");
      return rows as Link[];
    }

    // Get all links that are visible to this user
    const [rows] = await pool.execute(`
      SELECT DISTINCT l.* FROM links l
      LEFT JOIN link_visibility lv ON l.id = lv.linkId
      WHERE l.visibility = 'all' OR (l.visibility = 'specific' AND lv.userId = ?)
      ORDER BY l.title
    `, [userId]);
    
    return rows as Link[];
  }

  static async setVisibility(linkId: number, userIds: number[]): Promise<void> {
    const pool = await getPool();
    
    // Delete existing visibility
    await pool.execute('DELETE FROM link_visibility WHERE linkId = ?', [linkId]);
    
    // Insert new visibility
    if (userIds.length > 0) {
      const values = userIds.map(() => '(?, ?)').join(', ');
      const params = userIds.flatMap(uid => [linkId, uid]);
      await pool.execute(`INSERT INTO link_visibility (linkId, userId) VALUES ${values}`, params);
    }
  }

  static async getVisibilityUsers(linkId: number): Promise<number[]> {
    const pool = await getPool();
    const [rows] = await pool.execute('SELECT userId FROM link_visibility WHERE linkId = ?', [linkId]);
    return (rows as any[]).map(r => r.userId);
  }
}
