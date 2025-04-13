import sequelize from "sequelize";
import User from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { Op } from "sequelize";

class UsersService {
  public async updateUserBalance(
    userId: number,
    amount: number
  ): Promise<User> {
    if (amount === 0) {
      throw new ApiError(400, "Amount cannot be zero");
    }

    const [affectedRows, [updatedUser]] = await User.update(
      {
        balance: sequelize.literal(`balance + ${amount}`),
      },
      {
        where: {
          id: userId,
          ...(amount < 0 && {
            balance: { [Op.gte]: Math.abs(amount) },
          }),
        },
        returning: true,
      }
    );

    if (affectedRows === 0) {
      throw amount < 0
        ? new ApiError(400, "Insufficient funds or user not found")
        : new ApiError(404, "User not found");
    }

    return updatedUser;
  }
}

export default new UsersService();
