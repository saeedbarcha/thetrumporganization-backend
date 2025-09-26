import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';
import * as bcrypt from 'bcrypt';
import { User } from 'src/modules/user/entities/user.entity';

@Injectable()
export class UserSeederService {
    constructor(private dataSource: DataSource) { }

    async seed() {
       
        const adminUser = {
            name: 'admin',
            email: 'admin@gmail.com',
            phone: '0311111111',
            password: '123456',
            payout_date: '2024-02-02',
            role: UserRoleEnum.ADMIN
        };

        await this.seedUser(adminUser);

        console.log('Seeding users completed');
    }

    async seedUser(createUserDto: any) {
        // Hash password if needed (example with bcrypt)
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        createUserDto.password = hashedPassword;

        const newUser = new User();
        Object.assign(newUser, createUserDto);

        // Save the user to the database
        return await this.dataSource.getRepository(User).save(newUser);
    }
}
