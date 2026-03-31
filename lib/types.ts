export type Club = {
  recordId?: string;
  clubId?: string;   
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
  clubIcebreakers?: string;
  verification?: string;
  verified?: string;
  communityStatus?: string | string[];
  communityType?: string | string[];
  updatedAt?: string;
};


export type UserRow = {
  userId: string;
  email: string;
  passwordHash: string;
};
