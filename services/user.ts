import { db } from "@/app/db/db";
import { usersTable } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export class UserService {
  async getUserByUiId(uiId: string) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.uiId, uiId))
      .limit(1);
    return user[0] || null;
  }

  async createUser(uiId: string) {
    const newUser = await db
      .insert(usersTable)
      .values({ uiId })
      .returning();
    return newUser[0];
  }

  async createIfNotExists(uiId: string) {
    let user = await this.getUserByUiId(uiId);
    if (!user) {
      user = await this.createUser(uiId);
    }
    return user;
  }
}
