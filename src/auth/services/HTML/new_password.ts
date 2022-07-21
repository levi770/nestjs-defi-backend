/* eslint-disable prettier/prettier */
export function new_password(url: string, password: string) {
    return `<div style="background-color: #f7f7f7; padding: 50px 20px 40px; overflow-x: auto;">
    <table align="center" width="100%"
           style="max-width: 920px; border-spacing: 0; color: #282828; font-family: 'Arial', sans-serif;">
        <tr>
            <td>
                <table bgcolor="white" width="100%" style="
                    box-shadow: 0 2px 9px rgba(61, 63, 66, 0.152262);
                    margin-bottom: 27px;
                    border-spacing: 0;
                    border-radius: 20px;">
                    <tr>
                        <td style="padding-left: 60px; padding-right: 60px; padding-top: 50px; padding-bottom: 45px;">
                            <table width="100%" style="border-spacing: 0; text-align: center; font-size: 20px; line-height: 1.4;">
                                <tr>
                                    <td>
                                        <img src="${url}/public/img/charity-token.png" alt="Charity Token">
                                        <h1 style="margin-bottom: 41px; margin-top: 41px; font-size: 62px; font-weight: bold; line-height: 148%; letter-spacing: -0.602025px;">
                                            Charity Token
                                        </h1>
                                        <p style="margin-bottom: 20px; margin-top: 0;">
                                            Here’s your temporary password to login.
                                        </p>
                                        <p style="margin-bottom: 20px; margin-top: 0;">
                                            ${password}
                                        </p>
                                        <p style="margin-bottom: 20px; margin-top: 0;">
                                            Important! Change your temporary password immediately after you login. Please navigate to your settings in the Charity Token to change your password.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table style="margin:28px auto 24px;">
                                            <tr>
                                                <td style="padding-left: 10px; padding-right: 10px;">
                                                    <a href="https://www.facebook.com/CharityTokenPyLtd" target="_blank" rel="nofollow">
                                                        <img src="${url}/public/img/facebook.png" alt="Facebook">
                                                    </a>
                                                </td>
                                                <td style="padding-left: 10px; padding-right: 10px;">
                                                    <a href="https://twitter.com/CharityToken4" target="_blank" rel="nofollow">
                                                        <img src="${url}/public/img/twitter.png" alt="Twitter">
                                                    </a>
                                                </td>
                                                <td style="padding-left: 10px; padding-right: 10px;">
                                                    <a href="https://www.youtube.com/channel/UCls-aQZA39wxxcn3JEQpgug" target="_blank" rel="nofollow">
                                                        <img src="${url}/public/img/youtube.png" alt="Youtube">
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom: 20px;">
                                        Charity Token Pty Ltd © 2022. All Rights Reserved.<br/>
                                        80-82 Oxley Drive, Karalee QLD 4306 Australia
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table style="text-align: center; margin: auto; font-size: 20px;">
                                            <tr>
                                                <td style="padding: 10px;">
                                                    <a target="_blank" href="https://charitytoken.online" style="color: #74AF27; text-decoration: none;">Visit Us</a>
                                                </td>
                                                <td style="padding: 10px;">
                                                    <a href="https://www.charitytoken.online/wp-content/uploads/2022/04/PRIVACY-POLICY.pdf" target="_blank" style="color: #74AF27; text-decoration: none;">Privacy
                                                        Policy</a>
                                                </td>
                                                <td style="padding: 10px;">
                                                    <a href="https://www.charitytoken.online/wp-content/uploads/2022/04/PRIVACY-POLICY.pdf" target="_blank" style="color: #74AF27; text-decoration: none;">Terms
                                                        of Use</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</div>`
}
