'use client';

import { LogOut } from 'lucide-react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';

export function SignOutButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="onDark" size="sm" block loading={pending}>
      {pending ? null : <LogOut aria-hidden="true" className="size-4" />}
      {label}
    </Button>
  );
}
