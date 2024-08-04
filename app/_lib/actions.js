"use server";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

export async function updateGuests(formData) {
  // 1-authentication
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2-authorization
  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  // regEx
  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  // 3-building updates
  const updateData = { nationalID, nationality, countryFlag };

  // 4-mutation
  const { error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user?.guestId);

  // 5-error handeling
  if (error) throw new Error("Guest could not be updated");

  // 6-revalidation
  revalidatePath("/account/profile");
}

export async function deleteReservations(bookingId) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const guestBokings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBokings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this bookings");

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  const bookingId = Number(formData.get("bookingId"));

  // 1- Authentications
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // 2- Authorizations
  const guestBokings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBokings.map((booking) => booking.id);

  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this bookings");

  // 3- Building updates
  const updateData = {
    numGuests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 150),
  };

  // 4-Mutations
  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId)
    .select()
    .single();

  // 5-error handeling
  if (error) throw new Error("Booking could not be updated");

  // 6-Revalidating
  revalidatePath(`/account/reservations/edit/${bookingId}`);
  revalidatePath("/account/reservations");

  // 7-redirecting
  redirect("/account/reservations");
}
