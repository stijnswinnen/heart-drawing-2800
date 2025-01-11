import React from 'react';
import { Input } from './ui/input';
import { useSession } from '@supabase/auth-helpers-react';

interface UserInfoSectionProps {
  name: string;
  email: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}

export const UserInfoSection = ({ 
  name, 
  email, 
  onNameChange, 
  onEmailChange 
}: UserInfoSectionProps) => {
  const session = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Jouw naam
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Vul je naam in"
          disabled={isLoggedIn && name.trim() !== ''}
          required
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Jouw e-mailadres
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Vul je e-mailadres in"
          disabled={isLoggedIn && email.trim() !== ''}
          required
        />
      </div>
    </div>
  );
};