import {
    LayoutGrid,
    Cpu,
    Briefcase,
    FlaskConical,
    Gavel,
    Heart,
    Palette,
    MapPin,
    Trophy,
} from 'lucide-react';

export const ALL_CATEGORIES = [
    { name: 'Top Stories', icon: LayoutGrid },
    { name: 'Nigeria', icon: MapPin },
    { name: 'World News', icon: Gavel },
    { name: 'Technology', icon: Cpu },
    { name: 'Finance & Markets', icon: Briefcase },
    { name: 'Science & Nature', icon: FlaskConical },
    { name: 'Sports', icon: Trophy },
    { name: 'Lifestyle', icon: Heart },
    { name: 'Arts & Culture', icon: Palette },
];

export type CategoryName = typeof ALL_CATEGORIES[number]['name'];
