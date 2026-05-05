import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

export interface Parent {
  id: number;
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
  affiliation: string;
}

export interface Child {
  id: number;
  parentId: number;
  firstName: string;
  lastName?: string;
  dob: string;
  requestedHours: string;
  startDate: string;
  immunizationStatus: string;
}

@Injectable()
export class WaitlistService {
  // Parents CRUD
  async createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
    const { data, error } = await supabase
      .from('parents')
      .insert(parent)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getParent(id: number): Promise<Parent | null> {
    const { data, error } = await supabase
      .from('parents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async updateParent(id: number, updates: Partial<Omit<Parent, 'id'>>): Promise<Parent | null> {
    const { data, error } = await supabase
      .from('parents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }

  async deleteParent(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('parents')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Children CRUD
  async createChild(child: Omit<Child, 'id'>): Promise<Child> {
    const { data, error } = await supabase
      .from('children')
      .insert(child)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getChild(id: number): Promise<Child | null> {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }

  async updateChild(id: number, updates: Partial<Omit<Child, 'id'>>): Promise<Child | null> {
    const { data, error } = await supabase
      .from('children')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return null;
    return data;
  }

  async deleteChild(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', id);
    return !error;
  }

  // Special POST: Create both parent and child together
  async addParentAndChild(
    parentData: Omit<Parent, 'id'>,
    child: Omit<Child, 'id' | 'parentId'>,
  ): Promise<{ parent: Parent; child: Child }> {
    const parent = await this.createParent(parentData);
    const childData = { ...child, parentId: parent.id };
    const newChild = await this.createChild(childData);
    return { parent, child: newChild };
  }
}
