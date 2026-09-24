export type Favourite = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  icon: string | null;
  category: string | null;
  position: number;
  visit_count: number;
  last_visited_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FavouriteDraft = Pick<Favourite, 'name' | 'url' | 'category' | 'icon'>

