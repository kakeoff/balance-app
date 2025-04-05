import { NextFunction, Request, Response } from 'express';
import usersService from '../services/users.service';

class UsersController {
  public async updateBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount } = req.body;
      const user = await usersService.updateUserBalance(userId, amount);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();
