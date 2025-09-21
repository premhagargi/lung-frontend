import { format } from 'date-fns';

interface WelcomeHeaderProps {
  name: string;
}

export default function WelcomeHeader({ name }: WelcomeHeaderProps) {
  const currentDate = format(new Date(), 'EEEE, MMMM d');

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back, {name}!</h1>
      <p className="text-muted-foreground">{currentDate}</p>
    </div>
  );
}
