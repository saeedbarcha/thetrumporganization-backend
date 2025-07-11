import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { User } from './user.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { PaymentTypeEnum } from '../enum/user.role.enum';


@Entity()
export class ClientInfo extends DefaultEntity {

    @Column({ default: false })
    is_verified_email: boolean;

    @Column({ nullable: true })
    phone: string;

    // @Column({ nullable: true })
    // otp: string;

    @Column({ nullable: true })
    telegram_url: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    payout_amount: number;

    @Column({ type: 'timestamp', nullable: true })
    payout_date: Date;

    @OneToOne(() => Attachment, { nullable: true })
    @JoinColumn({ name: 'attachment_id' })
    attachment: Attachment;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'affiliate_id' })
    affiliate_id: User;

   @Column({ nullable: true })
   payment_source: PaymentTypeEnum;

    @OneToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

}
