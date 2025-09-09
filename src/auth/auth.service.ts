import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        @InjectRepository(User) private readonly usersRepo: Repository<User>,
    ) {}

    async register(data: { username: string; email: string; password: string; defaultCurrencyId?: number }) {
        const password_hash = await bcrypt.hash(data.password, 10);
        const user = this.usersRepo.create({
            username: data.username,
            email: data.email,
            password_hash,
            ...(data.defaultCurrencyId && { defaultCurrency: { id: data.defaultCurrencyId } as any }),
        });
        await this.usersRepo.save(user);
        return this.sign(user);
    }

    async validate(usernameOrEmail: string, password: string) {
        const user = await this.usersRepo.findOne({
            where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
            relations: ['defaultCurrency'],
        });
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        return user;
    }

    sign(user: User) {
        const payload = { sub: user.id, username: user.username };
        return { access_token: this.jwt.sign(payload) };
    }
}
