'use client';

import { User, Mail, MapPin, Calendar, Award, BookOpen, Code, Globe } from 'lucide-react';
import { aboutMeConfig } from '~/lib/about-me-config';

interface AboutMeProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function AboutMe({ className = '', variant = 'default' }: AboutMeProps) {
  const currentYear = new Date().getFullYear();
  const experienceYears = currentYear - aboutMeConfig.startYear;

  // Mapeamento de ícones
  const iconMap = {
    Code,
    Award,
    BookOpen,
    Globe,
    User,
    Mail,
    MapPin,
    Calendar
  };

  if (variant === 'compact') {
    return (
      <div className={`glass-card rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{aboutMeConfig.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {aboutMeConfig.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">
            {aboutMeConfig.name}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {aboutMeConfig.title}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-500">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{aboutMeConfig.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{aboutMeConfig.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{experienceYears}+ anos de experiência</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Sobre mim
        </h4>
        <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
          {aboutMeConfig.bio}
        </p>
      </div>
    </div>
  );
} 