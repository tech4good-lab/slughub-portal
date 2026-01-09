export type Club = {
  recordId?: string; // ✅ Airtable record id (recXXXX)
  clubId?: string;   // your UUID field
  ownerUserId?: string;
  name?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  calendarUrl?: string;
  discordUrl?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  updatedAt?: string;
};


export type UserRow = {
  userId: string;
  email: string;
  passwordHash: string;
};
