import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Attachment } from 'src/modules/attachment/entities/attachment.entity';
import { DefaultEntity } from 'src/modules/common/default.entity';
import { PaymentTypeEnum } from '../enum/user.role.enum';

@Entity()
export class AffiliateInFo extends DefaultEntity {

    // @Column({ default: false })
    // is_verified_email: boolean;

    @Column({ nullable: true })
    phone: string;

    // @Column({ nullable: true })
    // otp: string;
    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    payout_amount: number;

    @Column({ nullable: true })
    payment_source: PaymentTypeEnum;

    @Column({ type: 'timestamp', nullable: true })
    payout_date: Date;

    @Column({ nullable: true })
    telegram_url: string;

    @OneToOne(() => User, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToOne(() => Attachment, { nullable: true })
    @JoinColumn({ name: 'attachment_id' })
    attachment: Attachment;

}
