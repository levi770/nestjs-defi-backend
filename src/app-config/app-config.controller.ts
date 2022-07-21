import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
    Patch,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common'
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface'
import { editFileName } from 'src/common/file-upload-util'
import { Roles } from 'src/roles/guards/roles-auth.decorator'
import { RolesGuard } from 'src/roles/guards/roles.guard'
import { AppConfigService } from './app-config.service'
import { ConfigDto } from './dto/config.dto'
import { AllTokensFilterDto } from './dto/filter.dto'
import { OneTokenDto } from './dto/one-token.dto'
import { TokenInfoDto } from './dto/token-info.dto'
import { TokenDto } from './dto/token.dto'
import { UserConfigDto } from './dto/user-config.dto'
import { AppConfig } from './models/app-config.model'
import { ExtToken } from './models/ext-tokens.model'
import { UserConfig } from './models/user-config.model'
import { FileFastifyInterceptor, MulterFile } from 'fastify-file-interceptor'
import { diskStorage } from 'multer'
import { AddFilesDto } from 'src/common/dto/add-files.dto'
import { ConfigService } from '@nestjs/config'
import { EmailGuard } from 'src/auth/guards/email.guard'

@ApiTags('Configuration')
@Controller('config')
export class AppConfigController {
    constructor(private appConfigService: AppConfigService, private configService: ConfigService) {}

    //===============================================================================================
    // USER: GET USER APP CONFIGURATION
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET USER APP CONFIGURATION',
        description: 'Returns user app config data from db',
    })
    @ApiResponse({ status: 200, type: UserConfig })
    @Roles('SUPERADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('user')
    async getUserConfiguration(@Req() request: RequestWithUser) {
        return await this.appConfigService.getUserConfiguration(request.user.id)
    }

    //===============================================================================================
    // USER: SET USER APP CONFIGURATION
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: SET USER APP CONFIGURATION',
        description: 'Updates user app config data in db',
    })
    @ApiResponse({ status: 200, type: 'Configuration updated' })
    @Roles('SUPERADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Post('user')
    async updateUserConfiguration(@Req() request: RequestWithUser, @Body() config: UserConfigDto) {
        const result = await this.appConfigService.updateUserConfiguration(request.user.id, config)
        return result[0] ? 'Configuration updated' : 'Configuration not updated'
    }

    //===============================================================================================
    // USER: GET SUPPORT EMAIL
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET SUPPORT EMAIL',
    })
    @ApiResponse({ status: 200, type: 'email' })
    @Roles('SUPERADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('support')
    async getSupportEmail() {
        return await this.appConfigService.getConfigurationItem('supportEmail')
    }

    //===============================================================================================
    // ADMIN: GET CONFIGURATION
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: GET APP CONFIGURATION',
    })
    @ApiResponse({ status: 200, type: AppConfig })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Get()
    async getConfiguration() {
        return await this.appConfigService.getConfiguration()
    }

    //===============================================================================================
    // ADMIN: UPDATE CONFIGURATION
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: UPDATE APP CONFIGURATION',
    })
    @ApiResponse({ status: 200, type: 'Token updated' })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Post()
    async updateConfiguration(@Body() config: ConfigDto) {
        const result = await this.appConfigService.updateConfiguration(config)
        return result[0] ? 'Configuration updated' : 'Configuration not updated'
    }

    //============================================================================================
    //============================================================================================
    @ApiOperation({
        summary: 'USER: UPLOAD FILE TO SERVER',
    })
    @ApiResponse({ status: 200 })
    @ApiConsumes('multipart/form-data')
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('files')
    @UseInterceptors(
        FileFastifyInterceptor('files', {
            storage: diskStorage({
                destination: './uploads/files',
                filename: editFileName,
            }),
        }),
    )
    async addFiles(@Body() body: AddFilesDto, @UploadedFile() file: MulterFile) {
        const app_url = await this.configService.get('URL')
        return { url: `${app_url}/${file.path}`, ...file }
    }

    //===============================================================================================
    // ADMIN: ADD NEW TOKEN
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: ADD NEW EXTERNAL TOKEN',
        description: 'Adds new token in db',
    })
    @ApiResponse({ status: 200, type: ExtToken })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Post('tokens')
    addNewToken(@Body() token: TokenDto) {
        return this.appConfigService.addToken(token)
    }

    //===============================================================================================
    // USER: GET TOKEN INFO
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET EXTERNAL TOKEN INFO',
        description: 'Returns one or many tokens metadata from CoinMarketCap',
    })
    @ApiResponse({ status: 200, type: ExtToken })
    @Roles('SUPERADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('tokens/info')
    async getTokenInfo(@Query() query: TokenInfoDto) {
        return await this.appConfigService.getTokenInfo(query.symbol)
    }

    //===============================================================================================
    // USER: GET ONE TOKEN
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ONE EXTERNAL TOKEN',
        description: 'Returns one token from db',
    })
    @ApiResponse({ status: 200, type: ExtToken })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('tokens/:id')
    async getOneToken(@Param() param: OneTokenDto) {
        const result = await this.appConfigService.oneToken(param)
        return result ? result : 'Token not found'
    }

    //===============================================================================================
    // USER: GET ALL TOKENS
    //===============================================================================================
    @ApiOperation({
        summary: 'USER: GET ALL EXTERNAL TOKENS',
        description: 'Returns all tokens from db',
    })
    @ApiResponse({ status: 200, type: [ExtToken] })
    @Roles('SUPERADMIN', 'ADMIN', 'USER')
    @UseGuards(JwtGuard, EmailGuard, RolesGuard)
    @Get('tokens')
    getAllTokens(@Query() filter?: AllTokensFilterDto) {
        if (Object.keys(filter).length === 0) {
            filter.page = null
            filter.limit = null
        }

        if (filter.chainId != undefined) {
            return this.appConfigService.getAllTokensByNetwork(filter)
        }

        return this.appConfigService.allTokens(filter)
    }

    //===============================================================================================
    // ADMIN: UPDATE TOKEN
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: UPDATE EXTERNAL TOKEN',
        description: 'Updates token data in db',
    })
    @ApiResponse({ status: 200, type: 'Token updated' })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Patch('tokens/:id')
    async updateToken(@Param() param: OneTokenDto, @Body() token: TokenDto) {
        const result = await this.appConfigService.updateToken(param, token)
        return result[0] ? 'Token updated' : 'Token not updated'
    }

    //===============================================================================================
    // ADMIN: DELETE TOKEN
    //===============================================================================================
    @ApiOperation({
        summary: 'ADMIN: DELETE EXTERNAL TOKEN',
        description: 'Delete token from db',
    })
    @ApiResponse({ status: 200, type: 'Token deleted' })
    @Roles('SUPERADMIN', 'ADMIN')
    @UseGuards(JwtGuard, RolesGuard)
    @Delete('tokens/:id')
    async deleteToken(@Param() param: OneTokenDto) {
        const result = await this.appConfigService.deleteToken(param)
        return result ? 'Token deleted' : 'Token not deleted'
    }
}
