import { format } from 'date-fns';

interface WelcomeHeaderProps {
  name: string;
}

export default function WelcomeHeader({ name }: WelcomeHeaderProps) {
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <div>
      <h1 className="text-4xl tracking-tight">Welcome back, Dr. {name}!</h1>
      <h5 className="text-muted-foreground tracking-tght">{currentDate}</h5>
    </div>
  );
}
