export type Position = "TOP" | "JUNGLE" | "MID" | "ADC" | "SUPPORT";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
};

export type ImageData = {
  image_url?: string | null;
  image_key?: string | null;
  alt_text?: string | null;
};

export type NamedImage = {
  name: string;
  image?: ImageData | null;
};

export type ChampionTier = {
  rank?: number;
  champion_id: string;
  name_ko: string;
  name_en?: string;
  image?: ImageData | null;
  position?: Position;
  tier?: number;
  win_rate?: number;
  pick_rate?: number;
  ban_rate?: number;
  kda?: number;
};

export type TierListData = {
  position?: Position;
  query?: string;
  champions: ChampionTier[];
};

export type ChatData = {
  answer: string;
  related_champions: Array<{
    champion_id: string;
    name_ko: string;
  }>;
  attachments?: ChatAttachment[];
};

export type ChatAttachment =
  | {
      type: "champion_build";
      title: string;
      data: BuildData;
    }
  | {
      type: "counters";
      title: string;
      data: CounterData;
    }
  | {
      type: string;
      title: string;
      data: unknown;
    };

export type BuildData = {
  champion_id: string;
  position: Position;
  champion_image?: NamedImage | null;
  runes?: {
    primary_style?: string;
    keystone?: NamedImage | null;
    primary_runes?: string[];
    primary_rune_images?: NamedImage[];
    secondary_style?: string;
    secondary_runes?: string[];
    secondary_rune_images?: NamedImage[];
    stat_shards?: string[];
  };
  spells?: NamedImage[];
  items?: {
    start_items?: NamedImage[];
    core_items?: NamedImage[];
    boots?: NamedImage[];
    situational_items?: Array<NamedImage & { reason?: string }>;
  };
  skills?: {
    priority?: string[];
    priority_images?: NamedImage[];
    description?: string;
  };
  counters?: CounterChampion[];
  summary?: string;
};

export type CounterChampion = {
  champion_id: string;
  name_ko: string;
  reason?: string;
  image?: ImageData | null;
};

export type CounterData = {
  champion_id: string;
  position: Position;
  counters: CounterChampion[];
};
