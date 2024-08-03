import { auth } from "../_lib/auth";
import {
  getBookedDatesByCabinId,
  getCabin,
  getSettings,
} from "../_lib/data-service";
import DateSelector from "./DateSelector";
import LoginMessage from "./LoginMessage";
import ReservationForm from "./ReservationForm";

export default async function Reservations({ cabin }) {
  const session = await auth();
  const [settings, bookedDates] = await Promise.all([
    getSettings(),
    getBookedDatesByCabinId(cabin.id),
  ]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 border border-primary-800 min-h-[400px]">
      {session?.user ? (
        <ReservationForm cabin={cabin} user={session.user} />
      ) : (
        <LoginMessage />
      )}
      <DateSelector
        settings={settings}
        bookedDates={bookedDates}
        cabin={cabin}
      />
    </div>
  );
}
