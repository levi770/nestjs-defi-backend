import * as bcrypt from 'bcryptjs'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { User } from './models/users.model'
import { UserDataDto } from './dto/user-data.dto'
import { UserData } from './models/user-data.model'
import { Role } from 'src/roles/models/roles.model'
import { Op } from 'sequelize'
import { UserTokens } from './models/user-tokens.model'
import { RegisterDto } from 'src/auth/dto/register.dto'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { UserWallet } from '../wallet/models/user-wallet.model'
import { UserConfig } from 'src/app-config/models/user-config.model'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User) private userRepository: typeof User,
        @InjectModel(UserData) private userDataRepository: typeof UserData,
        @InjectModel(UserTokens) private userTokensRepository: typeof UserTokens,
    ) {}

    //#region Create

    async createUser(role: Role, addresses: any[], dto: RegisterDto) {
        try {
            const user = await this.userRepository.create(dto)

            await user.$add('user_roles', [role.id])
            await user.$set('user_data', await this.userDataRepository.create())
            await user.$set('user_tokens', await this.userTokensRepository.create())
            addresses.forEach(async (a) => {
                await user.$create('user_wallet', a)
            })

            return this.getUserById(user.id)
        } catch (error) {
            if (error.message === 'Validation error')
                throw new HttpException('User with this email or phone already exist', HttpStatus.BAD_REQUEST)

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async createAdmin(role: Role, addresses: any[], dto: RegisterDto) {
        try {
            const user = await this.userRepository.create(dto)

            await user.$add('user_roles', [role.id])
            await user.$set('user_data', await this.userDataRepository.create())
            await user.$set('user_tokens', await this.userTokensRepository.create())
            addresses.forEach(async (a) => {
                await user.$create('user_wallet', a)
            })

            return this.getUserById(user.id)
        } catch (error) {
            if (error.message === 'Validation error')
                throw new HttpException('User with this email or phone already exist', HttpStatus.BAD_REQUEST)

            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async createWithGoogle(email: string, name: string) {
        const user = await this.userRepository.create({ email, isRegisteredWithGoogle: true })
        await this.userDataRepository.create({ firstname: name, userId: user.id })
        return user
    }

    //#endregion

    //#region Get

    async getAllUsers(paginate?: PaginateDto) {
        try {
            return await this.userRepository.findAndCountAll({
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
                include: [
                    {
                        model: UserData,
                        attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                    },
                    {
                        model: Role,
                        attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
                        through: { attributes: [] },
                    },
                    {
                        model: UserWallet,
                        attributes: ['type', 'label', 'address'],
                    },
                ],
                offset:
                    !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
                limit: !paginate || !paginate.limit ? null : paginate.limit,
                order: [['createdAt', 'DESC']],
            })
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
        }
    }

    async getByEmail(email: string) {
        return await this.userRepository.findOne({
            where: { email },
            include: [
                {
                    model: UserData,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
                {
                    model: Role,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
                    through: { attributes: [] },
                },
                {
                    model: UserWallet,
                    attributes: ['type', 'label', 'address', 'keystore'],
                },
                {
                    model: UserTokens,
                    attributes: ['firebase_secret'],
                },
                {
                    model: UserConfig,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
            ],
        })
    }

    async getById(id: string) {
        return await this.userRepository.findByPk(id, {
            include: [
                {
                    model: UserData,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
                {
                    model: Role,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
                    through: { attributes: [] },
                },
                {
                    model: UserWallet,
                    attributes: ['type', 'label', 'address'],
                },
                {
                    model: UserTokens,
                    attributes: ['firebase_secret'],
                },
                {
                    model: UserConfig,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
            ],
        })
    }

    async getUserById(id: string) {
        return await this.userRepository.findByPk(id, {
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
            include: [
                {
                    model: UserData,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
                {
                    model: Role,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
                    through: { attributes: [] },
                },
                {
                    model: UserWallet,
                    attributes: ['type', 'label', 'address', 'keystore'],
                },
                {
                    model: UserTokens,
                    attributes: ['firebase_secret'],
                },
                {
                    model: UserConfig,
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
            ],
        })
    }

    async searchUser(searchValue: string) {
        const value = { [Op.iLike]: `%${searchValue}%` }
        const fields = Object.keys(UserData.getAttributes())
        const omits = ['id', 'userId', 'createdAt', 'updatedAt']
        omits.forEach((item) => delete fields[fields.indexOf(item)])

        const filters = []
        fields.forEach((item) => {
            const key = `$user_data.${item}$`
            const obj = { [key]: searchValue }
            filters.push(obj)
        })

        const result = await this.userRepository.findAll({
            where: {
                [Op.or]: [{ email: value }, { status: value }, { phone: value }, ...filters],
            },
            attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
            include: [
                {
                    model: UserData,
                    as: 'user_data',
                    attributes: { exclude: ['id', 'userId', 'createdAt', 'updatedAt'] },
                },
                {
                    model: Role,
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
                    through: { attributes: [] },
                },
                {
                    model: UserWallet,
                    attributes: ['type', 'label', 'address'],
                },
            ],
        })

        if (result.length === 0) throw new HttpException('Not found', HttpStatus.OK)

        return result
    }

    //#endregion

    //#region Update

    async updateUserData(user: User, userDataDto?: UserDataDto) {
        return await this.userDataRepository.update(userDataDto, { where: { userId: user.id } })
    }

    async updateUserPassword(user: User, userPasswordDto: string) {
        user.password = await bcrypt.hash(userPasswordDto, 10)
        await user.save()

        return 'Password saved'
    }

    async setCurrentRefreshToken(refreshToken: string, userId: string) {
        const refresh_token = await bcrypt.hash(refreshToken, 10)
        await this.userTokensRepository.update({ refresh_token }, { where: { userId: userId } })
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
        const userTokens = await this.userTokensRepository.findOne({ where: { userId } })
        const isRefreshTokenMatching = await bcrypt.compare(refreshToken, userTokens.refresh_token)

        if (isRefreshTokenMatching) {
            return this.getUserById(userId)
        }
    }

    async markEmailAsConfirmed(email: string) {
        return this.userRepository.update({ isEmailConfirmed: true, status: 'ACTIVE' }, { where: { email } })
    }

    async setNewUserPassword(password: string, id: string) {
        return this.userRepository.update({ password }, { where: { id } })
    }

    async markPhoneNumberAsConfirmed(userId: string) {
        return await this.userRepository.update(
            { isPhoneNumberConfirmed: true, status: 'ACTIVE' },
            { where: { id: userId } },
        )
    }

    //#endregion

    //#region Block/Activate

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async blockUser(id: string, reason: string) {
        const user = await this.userRepository.findByPk(id)
        if (!user) throw new HttpException('User not found', HttpStatus.OK)
        await user.update('status', 'BLOCKED')
        return await this.getUserById(id)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async activateUser(id: string, reason: string) {
        const user = await this.userRepository.findByPk(id)
        if (!user) throw new HttpException('User or role not found', HttpStatus.OK)
        await user.update('status', 'ACTIVE')
        return await this.getUserById(id)
    }

    async delete(id: string) {
        return await this.userRepository.destroy({ where: { id } })
    }

    //#endregion

    //#region Tokens

    async removeRefreshToken(userId: string) {
        return this.userTokensRepository.update({ refresh_token: null }, { where: { userId } })
    }

    async setTwoFactorSecret(secret: string, userId: string) {
        return this.userTokensRepository.update({ twoFactor_secret: secret }, { where: { userId } })
    }

    async turnOnTwoFactor(id: string) {
        return this.userRepository.update({ isTwoFactorAuthenticationEnabled: true }, { where: { id } })
    }

    async turnOffTwoFactor(id: string) {
        return this.userRepository.update({ isTwoFactorAuthenticationEnabled: false }, { where: { id } })
    }

    async getTwoFactorTokenbyId(id: string) {
        const token = await this.userTokensRepository.findOne({
            where: { userId: id },
            attributes: ['twoFactor_secret'],
        })

        if (!token) throw new HttpException('Two-factor authentication token not found', HttpStatus.OK)

        return token.twoFactor_secret
    }

    async setDeviceToken(userId: string, token: string) {
        return await this.userTokensRepository.update({ firebase_secret: token }, { where: { userId: userId } })
    }

    async getDeviceToken(userId: string) {
        const userTokens = await this.userTokensRepository.findOne({ where: { userId: userId } })
        return userTokens.firebase_secret
    }

    //#endregion
}
