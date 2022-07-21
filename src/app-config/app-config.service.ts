import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { ConfigDto } from './dto/config.dto'
import { OneTokenDto } from './dto/one-token.dto'
import { TokenDto } from './dto/token.dto'
import { UserConfigDto } from './dto/user-config.dto'
import { UserConfig } from './models/user-config.model'
import { PaginateDto } from 'src/common/dto/paginate.dto'
import { ConfigService } from '@nestjs/config'
import { ExtToken } from './models/ext-tokens.model'
import { AppConfig } from './models/app-config.model'
import { AllTokensFilterDto } from './dto/filter.dto'
import axios from 'axios'

@Injectable()
export class AppConfigService {
    constructor(
        @InjectModel(ExtToken) private tokensRepository: typeof ExtToken,
        @InjectModel(AppConfig) private configRepository: typeof AppConfig,
        @InjectModel(UserConfig) private userConfigRepository: typeof UserConfig,
        private configService: ConfigService,
    ) {}

    async getTokenInfo(query: string) {
        try {
            const opts = {
                headers: {
                    'X-CMC_PRO_API_KEY': await this.configService.get('COINMARKETCAP_API_KEY'),
                },
            }

            const url = `${await this.configService.get('COINMARKETCAP_API_URL')}cryptocurrency/info?symbol=${query}`

            const result = await axios.get(url, opts)
            return result.data
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    async updateUserConfiguration(id: string, config: UserConfigDto) {
        return await this.userConfigRepository.update(config, { where: { userId: id } })
    }

    async getUserConfiguration(id: string) {
        return (await this.userConfigRepository.findOrCreate({ where: { userId: id } }))[0]
    }

    async updateConfiguration(config: ConfigDto) {
        return await this.configRepository.update(config, { where: { name: 'base' } })
    }

    async getConfiguration() {
        return (
            await this.configRepository.findOrCreate({
                where: { name: 'base' },
                attributes: { exclude: ['id', 'createdAt'] },
            })
        )[0]
    }

    async getConfigurationItem(itemKey: string) {
        return await this.configRepository.findOne({
            attributes: [itemKey],
            where: { name: 'base' },
        })
    }

    async addToken(token: TokenDto) {
        return await this.tokensRepository.create(token)
    }

    async allTokens(paginate?: PaginateDto) {
        return await this.tokensRepository.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            offset: !paginate || !paginate.limit || !paginate.page ? null : 0 + (+paginate.page - 1) * +paginate.limit,
            limit: !paginate || !paginate.limit ? null : paginate.limit,
            order: [['createdAt', 'DESC']],
        })
    }

    async getAllTokensExcludeFields() {
        return await this.tokensRepository.findAll({
            attributes: { exclude: ['id', 'createdAt', 'updatedAt'] },
        })
    }

    async getAllTokensByNetwork(filter: AllTokensFilterDto) {
        return await this.tokensRepository.findAndCountAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: { chainId: filter.chainId },
            offset: !filter || !filter.limit || !filter.page ? null : 0 + (+filter.page - 1) * +filter.limit,
            limit: !filter || !filter.limit ? null : filter.limit,
            order: [['createdAt', 'DESC']],
        })
    }

    async getOneTokenBySymbolByNetwork(symbol: string, chainId: number) {
        return await this.tokensRepository.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: { symbol, chainId },
        })
    }

    async oneToken(query: OneTokenDto) {
        return await this.tokensRepository.findOne({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: { id: query.id },
        })
    }

    async updateToken(param: OneTokenDto, token: TokenDto) {
        return await this.tokensRepository.update(token, {
            where: { id: param.id },
        })
    }

    async deleteToken(param: OneTokenDto) {
        return await this.tokensRepository.destroy({
            where: { id: param.id },
        })
    }
}
