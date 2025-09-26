import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { UserRoleEnum } from 'src/modules/user/enum/user.role.enum';

@Entity()
export class User extends DefaultEntity {
    @Column({ nullable: true })
    name: string;

    @Column({ unique: true, nullable: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({
        type: "enum",
        enum: UserRoleEnum,
        default: UserRoleEnum.CLIENT
    })

    role: UserRoleEnum;
    
    @Column({ default: true })
    is_active: boolean;

}
