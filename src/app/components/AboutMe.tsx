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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {aboutMeConfig.highlights.map((highlight, index) => {
            const IconComponent = iconMap[highlight.icon as keyof typeof iconMap];
            const colorClasses = {
              blue: 'text-blue-500',
              green: 'text-green-500', 
              purple: 'text-purple-500',
              orange: 'text-orange-500'
            };
            
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <IconComponent className={`w-5 h-5 ${colorClasses[highlight.color as keyof typeof colorClasses]}`} />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{highlight.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{highlight.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
            💡 Por que confiar no meu conteúdo?
          </h5>
          <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
            {aboutMeConfig.trustPoints.map((point, index) => (
              <li key={index}>• {point.replace('Anos', `${experienceYears}+ anos`)}</li>
            ))}
          </ul>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {aboutMeConfig.skills.map((skill, index) => {
              const colors = [
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
                'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              ];
              
              return (
                <span 
                  key={index} 
                  className={`px-3 py-1 rounded-full text-sm font-medium ${colors[index % colors.length]}`}
                >
                  {skill}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 