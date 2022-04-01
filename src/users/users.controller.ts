import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminToken } from '../auth/guards/admin-role.guard';
import mapRequestToResponse from 'src/shared/functions/map-request-to-response.function';
import { IDbUser } from 'src/shared/interfaces/db-user.interface';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AdminToken)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() createUserDto: CreateUserDto) {
    return await mapRequestToResponse<IDbUser>(
      this.usersService,
      this.usersService.create,
      createUserDto,
    );
  }

  @Get()
  @UseGuards(AdminToken)
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll() {
    return await mapRequestToResponse<IDbUser[]>(
      this.usersService,
      this.usersService.findAll,
    );
  }

  @Patch()
  @UseGuards(AdminToken)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await mapRequestToResponse<IDbUser>(
      this.usersService,
      this.usersService.update,
      updateUserDto,
    );
  }

  @Patch(':id')
  @UseGuards(AdminToken)
  @UseInterceptors(ClassSerializerInterceptor)
  async updatePassword(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserPasswordDto,
  ) {
    return await mapRequestToResponse<void>(
      this.usersService,
      this.usersService.updatePassword,
      id,
      updateUserDto,
    );
  }

  @Delete(':id')
  @UseGuards(AdminToken)
  @UseInterceptors(ClassSerializerInterceptor)
  async remove(@Param('id') id: string) {
    return await mapRequestToResponse<void>(
      this.usersService,
      this.usersService.remove,
      id,
    );
  }
}
