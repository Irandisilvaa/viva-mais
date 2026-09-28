export type UserRole = 'worker' | 'professional' | 'manager' | 'admin';

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  unit_name?: string | null;
  sector?: string | null;
  organization_name?: string | null;
};

export type ServiceCategory = 'nutrition' | 'physical_activity' | 'wellbeing' | 'ergonomics' | 'mental_health';

export type ServiceSlot = {
  id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  booked_count: number;
  location?: string | null;
  status?: 'open' | 'closed' | 'cancelled';
};

export type HealthService = {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  duration_minutes: number;
  professional_id?: string | null;
  professional_name?: string | null;
  location?: string | null;
  image_url: string;
  active?: boolean;
  slots: ServiceSlot[];
};

export type AbsenceReason = 'work_demand' | 'schedule_conflict' | 'personal' | 'other';

export type Booking = {
  id: string;
  slot_id: string;
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  starts_at: string;
  service_title: string;
  location?: string | null;
  absence_reason?: AbsenceReason | null;
};

export type ProfessionalAttendee = {
  booking_id: string;
  user_id: string;
  full_name: string;
  booking_status: 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  absence_reason?: AbsenceReason | null;
};

export type ProfessionalOverview = {
  services: number;
  upcoming_slots: number;
  total_capacity: number;
  booked: number;
};

export type AdminUser = {
  id: string;
  full_name: string;
  role: UserRole;
  unit_id?: string | null;
  unit_name?: string | null;
  sector?: string | null;
  active: boolean;
};

export type ContentCategory = 'nutrition' | 'movement' | 'wellbeing' | 'mental_health' | 'ergonomics';
export type ContentFormat = 'article' | 'recipe' | 'guide' | 'video' | 'audio';

export type LearningContent = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  category: ContentCategory;
  format: ContentFormat;
  duration_minutes: number;
  image_url: string;
  official_guide: boolean;
  source_label?: string | null;
  source_url?: string | null;
  external_url?: string | null;
  media_url?: string | null;
  created_by?: string | null;
};

export type Campaign = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  image_url: string;
  cta_label: string;
};

export type WellbeingCheckinInput = { mood: number; energy: number; stress: number };

export type WellbeingCheckin = WellbeingCheckinInput & {
  id: string;
  occurred_on: string;
  privacy_notice_acknowledged_at: string;
  created_at: string;
};

export type BookingCreationResult = {
  booking_id: string;
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  created: boolean;
};

export type MetricItem = { label: string; value: number };
export type AttendanceMetricItem = { label: string; value: number; total?: number; attended?: number };

export type DashboardData = {
  total_bookings: number;
  attendance_rate: number;
  absence_rate: number;
  content_views: number;
  campaign_participants: number;
  wellbeing_responses: number;
  wellbeing_average: number | null;
  active_workers: number;
  units_count: number;
  sectors_count: number;
  bookings_by_category: MetricItem[];
  bookings_by_sector: MetricItem[];
  workers_by_sector: MetricItem[];
  attendance_by_sector: AttendanceMetricItem[];
};

export type ManagerFilterOptions = {
  units: { id: string; name: string }[];
  sectors: string[];
};

export type HydrationChannel = 'app' | 'email' | 'both' | 'off';

export type HydrationPreferences = {
  daily_goal_ml: number;
  serving_ml: number;
  routine_start: string;
  routine_end: string;
  interval_minutes: number;
  channel: HydrationChannel;
  email: string | null;
  timezone: string;
  enabled: boolean;
};
