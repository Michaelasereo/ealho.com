import { EventTypeCard } from "./EventTypeCard";

interface EventType {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  currency?: string;
  guests?: number;
  isActive?: boolean;
  isHidden?: boolean;
  dietitianName?: string;
}

interface EventTypesListProps {
  eventTypes: EventType[];
}

export function EventTypesList({ eventTypes }: EventTypesListProps) {
  if (eventTypes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#9ca3af]">No event types yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {eventTypes.map((eventType) => (
        <EventTypeCard key={eventType.id} {...eventType} />
      ))}
      <div className="text-center py-8">
        <p className="text-sm text-[#9ca3af]">No more results</p>
      </div>
    </div>
  );
}
