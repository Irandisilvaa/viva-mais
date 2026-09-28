import { Booking, Campaign, DashboardData, HealthService, LearningContent } from '@/types/domain';

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const afterTomorrow = new Date(Date.now() + 48 * 60 * 60 * 1000);
const inThreeDays = new Date(Date.now() + 72 * 60 * 60 * 1000);

function at(date: Date, hour: number, minute = 0) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const demoServices: HealthService[] = [
  {
    id: 'service-nutrition',
    title: 'Orientação nutricional',
    category: 'nutrition',
    description: 'Atendimento para orientação alimentar e promoção de hábitos saudáveis no contexto de trabalho.',
    duration_minutes: 30,
    professional_name: 'Equipe de Nutrição',
    location: 'NAS · Sala 02',
    image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
    slots: [
      { id: 'slot-nutri-1', service_id: 'service-nutrition', starts_at: at(tomorrow, 9), ends_at: at(tomorrow, 9, 30), capacity: 1, booked_count: 0, location: 'NAS · Sala 02' },
      { id: 'slot-nutri-2', service_id: 'service-nutrition', starts_at: at(tomorrow, 10), ends_at: at(tomorrow, 10, 30), capacity: 1, booked_count: 0, location: 'NAS · Sala 02' },
    ],
  },
  {
    id: 'service-movement',
    title: 'Ginástica laboral',
    category: 'physical_activity',
    description: 'Sessão breve de alongamento e mobilidade para realizar durante o expediente, conduzida pela equipe responsável.',
    duration_minutes: 15,
    professional_name: 'Equipe de Educação Física',
    location: 'Setores participantes',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    slots: [
      { id: 'slot-move-1', service_id: 'service-movement', starts_at: at(afterTomorrow, 8, 30), ends_at: at(afterTomorrow, 8, 45), capacity: 12, booked_count: 7, location: 'Bloco Administrativo' },
      { id: 'slot-move-2', service_id: 'service-movement', starts_at: at(inThreeDays, 9), ends_at: at(inThreeDays, 9, 15), capacity: 12, booked_count: 4, location: 'Bloco Administrativo' },
    ],
  },
  {
    id: 'service-ergonomics',
    title: 'Orientação postural',
    category: 'ergonomics',
    description: 'Acolhimento breve para orientar organização do posto de trabalho e práticas de autocuidado.',
    duration_minutes: 25,
    professional_name: 'NAS',
    location: 'NAS · Sala 04',
    image_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
    slots: [
      { id: 'slot-ergo-1', service_id: 'service-ergonomics', starts_at: at(afterTomorrow, 14), ends_at: at(afterTomorrow, 14, 25), capacity: 1, booked_count: 0, location: 'NAS · Sala 04' },
    ],
  },
];

export const demoContents: LearningContent[] = [
  {
    id: 'content-plate',
    title: 'Meu Prato: escolhas simples no dia a dia',
    excerpt: 'Uma referência visual para montar refeições variadas sem contar calorias.',
    body: 'Use metade do prato para verduras e legumes, combine fontes de proteína e alimentos in natura ou minimamente processados e adapte as escolhas à sua rotina. Esta tela é educativa e não substitui orientação individual de profissional habilitado.',
    category: 'nutrition',
    format: 'guide',
    duration_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
    official_guide: true,
    source_label: 'Baseado no Guia Alimentar para a População Brasileira',
    source_url: 'https://www.gov.br/saude/pt-br/assuntos/saude-brasil/publicacoes-para-promocao-a-saude/guia_alimentar_populacao_brasileira_2ed.pdf',
  },
  {
    id: 'content-recipe',
    title: 'Marmita prática para um dia corrido',
    excerpt: 'Ideias de combinação e substituições para organizar a refeição do trabalho.',
    body: 'Monte uma base com arroz, macaxeira ou outro alimento disponível, acrescente feijão ou outra leguminosa, uma fonte de proteína e vegetais. Troque por alternativas equivalentes quando necessário. A proposta é facilitar escolhas, não prescrever dieta.',
    category: 'nutrition',
    format: 'recipe',
    duration_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
    official_guide: true,
    source_label: 'Conteúdo educativo',
  },
  {
    id: 'content-pause',
    title: 'Pausa ativa: 5 minutos para se movimentar',
    excerpt: 'Uma sequência breve para interromper longos períodos sentado durante o expediente.',
    body: 'Faça movimentos leves de mobilidade de ombros, pescoço e membros inferiores respeitando seus limites. Em caso de dor ou restrição individual, procure orientação profissional.',
    category: 'movement',
    format: 'article',
    duration_minutes: 5,
    image_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    official_guide: false,
    source_label: 'Equipe de Educação Física',
  },
  {
    id: 'content-stress',
    title: 'Alimentação, pausa e estresse no trabalho',
    excerpt: 'Pequenas decisões que podem tornar a rotina mais previsível e menos desgastante.',
    body: 'Antecipar uma refeição, fazer pausas possíveis e manter água por perto pode ajudar a organizar a rotina. O foco aqui é promoção da saúde e educação, sem monitoramento individual de dieta.',
    category: 'wellbeing',
    format: 'article',
    duration_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=1200&q=80',
    official_guide: false,
    source_label: 'Conteúdo interdisciplinar',
  },
];

export const demoCampaigns: Campaign[] = [
  {
    id: 'campaign-pause',
    title: 'Semana da Pausa Ativa',
    description: 'Reserve alguns minutos do expediente para movimentar o corpo e conhecer as ações do NAS.',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
    cta_label: 'Ver atividades',
  },
];

export const demoBookings: Booking[] = [
  {
    id: 'booking-demo',
    slot_id: 'slot-move-1',
    status: 'confirmed',
    starts_at: at(afterTomorrow, 8, 30),
    service_title: 'Ginástica laboral',
    location: 'Bloco Administrativo',
  },
];

export const demoDashboard: DashboardData = {
  total_bookings: 286,
  attendance_rate: 78,
  absence_rate: 22,
  content_views: 438,
  campaign_participants: 164,
  wellbeing_responses: 92,
  wellbeing_average: 3.8,
  active_workers: 312,
  units_count: 3,
  sectors_count: 5,
  bookings_by_category: [
    { label: 'Movimento', value: 142 },
    { label: 'Nutrição', value: 74 },
    { label: 'Bem-estar', value: 42 },
    { label: 'Ergonomia', value: 28 },
  ],
  bookings_by_sector: [
    { label: 'Administrativo', value: 96 },
    { label: 'Assistência', value: 82 },
    { label: 'Tecnologia', value: 51 },
    { label: 'Gestão', value: 34 },
    { label: 'NAS', value: 23 },
  ],
  workers_by_sector: [
    { label: 'Administrativo', value: 108 },
    { label: 'Assistência', value: 91 },
    { label: 'Tecnologia', value: 49 },
    { label: 'Gestão', value: 36 },
    { label: 'NAS', value: 28 },
  ],
  attendance_by_sector: [
    { label: 'Administrativo', value: 81 },
    { label: 'Assistência', value: 76 },
    { label: 'Tecnologia', value: 84 },
    { label: 'Gestão', value: 73 },
    { label: 'NAS', value: 79 },
  ],
};
