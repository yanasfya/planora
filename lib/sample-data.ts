import { format, addDays } from "date-fns";
import { TripDocument } from "@/lib/zod-schemas";

export const sampleTrips: TripDocument[] = [
  {
    id: "trip-kyoto",
    title: "Kyoto Food Escape",
    destination: "Kyoto, Japan",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 3), "yyyy-MM-dd"),
    travelers: 2,
    preferences: ["food", "culture"],
    budget: {
      currency: "USD",
      total: 4200,
      breakdown: [
        { category: "Flights", amount: 1200 },
        { category: "Accommodation", amount: 1400 },
        { category: "Activities", amount: 950 },
        { category: "Dining", amount: 500 },
        { category: "Transit", amount: 150 }
      ]
    },
    itinerary: [
      {
        day: 1,
        date: format(new Date(), "yyyy-MM-dd"),
        summary: "Arashiyama exploration",
        items: [
          {
            id: "itm-1",
            time: "09:00",
            title: "Bamboo Grove Walk",
            location: "Arashiyama",
            category: "nature",
            cost: 0
          },
          {
            id: "itm-2",
            time: "12:30",
            title: "Kaiseki Lunch",
            location: "Gion Nanba",
            category: "dining",
            cost: 180
          },
          {
            id: "itm-3",
            time: "16:00",
            title: "Tea Ceremony Workshop",
            location: "Camellia Garden",
            category: "culture",
            cost: 95
          }
        ]
      },
      {
        day: 2,
        date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
        summary: "Markets and Sake",
        items: [
          {
            id: "itm-4",
            time: "10:00",
            title: "Nishiki Market Tour",
            location: "Nishiki Market",
            category: "food",
            cost: 120
          },
          {
            id: "itm-5",
            time: "14:00",
            title: "Fushimi Sake Tasting",
            location: "Fushimi",
            category: "beverage",
            cost: 90
          },
          {
            id: "itm-6",
            time: "19:30",
            title: "Kaiseki Dinner",
            location: "Kikunoi",
            category: "dining",
            cost: 220
          }
        ]
      }
    ],
    lodging: [
      {
        id: "lodging-1",
        name: "The Thousand Kyoto",
        address: "570 Higashishiokoji-cho",
        pricePerNight: 320,
        rating: 4.8,
        url: "https://www.booking.com"
      }
    ],
    weather: [
      {
        date: format(new Date(), "yyyy-MM-dd"),
        icon: "01d",
        description: "Clear sky",
        temperature: { high: 24, low: 16 }
      }
    ],
    notes: "Reserve tea ceremony in advance.",
    status: "draft"
  }
];
