import { db } from "@/app/db/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export class UserService {
  static async getUserByUiId(uiId: string) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.uiId, uiId))
      .limit(1);
    return user[0] || null;
  }

  static async createUser(uiId: string) {
    const newUser = await db.insert(usersTable).values({ uiId }).returning();
    return newUser[0];
  }

  static async createIfNotExists(uiId: string) {
    let user = await UserService.getUserByUiId(uiId);
    if (!user) {
      user = await UserService.createUser(uiId);
    }
    return user;
  }
}
