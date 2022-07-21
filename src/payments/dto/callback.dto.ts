export class CallbackDto {
    readonly userId: string
    readonly transactionId: number
    readonly requestId: number
    readonly status: string
    readonly createdAt: string
    readonly confirmedAt: string
    readonly finishedAt: string
    readonly blockchainHash: string
    readonly link: string
    readonly curIn: string
    readonly curOut: string
    readonly amountIn: number
    readonly amountOut: number
    readonly realAmountOut: number
    readonly targetAddress: string
    readonly reason: string
    readonly extra_info: object
    readonly couponCode: string
}
