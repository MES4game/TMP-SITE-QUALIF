import { type ReactNode, useEffect } from "react";
import { Link } from "react-router";
import RoomIcon from "@mui/icons-material/Room";
import EmailIcon from "@mui/icons-material/Email";
import HomeIcon from "@mui/icons-material/HomeFilled";
import AccountIcon from "@mui/icons-material/AccountCircle";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";
import { SvgIcon } from "@mui/material";
import DiscordIcon from "~/assets/images/discord-brands-solid.svg?react";
import { HOME_PAGE, PROFIL_PAGE } from "~/shared/config/const.config";
import "~/ui/components/common/infobar.component.css";

export default function InfobarComp(): ReactNode {
    useEffect(() => {
        console.log("Loaded: InfobarComp");
    }, []);

    useEffect(() => {
        console.log("Rendered: InfobarComp");
    });

    return (
        <footer id='infobar'>
            <div className='footer-section'>
                <h3>Contactez nous</h3>
                <ul>
                    <li>
                        <div className='footer-line'>
                            <RoomIcon style={{ width: 24, height: 24 }} />
                            <p>Adresse :</p>
                            <a href='https://maps.app.goo.gl/Y4Ds6c3uUZM1t8gLA' target='_blank' rel='noreferrer'>Salle B007, Bâtiment 620, Maison de l'Ingénieur, Rue Louis de Broglie, 91190 Orsay, France</a>
                        </div>
                    </li>
                    <li>
                        <div className='footer-line'>
                            <EmailIcon style={{ width: 24, height: 24 }} />
                            <p>Email :</p>
                            <a href='mailto:cia.polytech@gmail.com' target='_blank' rel='noreferrer'>cia.polytech@gmail.com</a>
                        </div>
                    </li>
                </ul>
            </div>
            <div className='footer-section'>
                <h3>Liens utiles</h3>
                <ul>
                    {HOME_PAGE && <li>
                        <Link to={HOME_PAGE.url} className='footer-line'>
                            <HomeIcon style={{ width: 24, height: 24 }} />
                            <p>{HOME_PAGE.title}</p>
                        </Link>
                    </li>}
                    {PROFIL_PAGE && <li>
                        <Link to={PROFIL_PAGE.url} className='footer-line'>
                            <AccountIcon style={{ width: 24, height: 24 }} />
                            <p>{PROFIL_PAGE.title}</p>
                        </Link>
                    </li>}
                </ul>
            </div>
            <div className='footer-section'>
                <h3>Suivez nous</h3>
                <ul>
                    <li>
                        <a href='https://discord.gg/S8gRM95wqw' target='_blank' rel='noreferrer' className='footer-line'>
                            <SvgIcon viewBox="0 0 576 512" style={{ width: 24, height: 24 }}>
                                <DiscordIcon />
                            </SvgIcon>
                            <p>Discord</p>
                        </a>
                    </li>
                    <li>
                        <a href='https://github.com/CIA-PoPS' target='_blank' rel='noreferrer' className='footer-line'>
                            <GitHubIcon style={{ width: 24, height: 24 }} />
                            <p>GitHub</p>
                        </a>
                    </li>
                    <li>
                        <a href='https://www.facebook.com/profile.php?id=61555761136479' target='_blank' rel='noreferrer' className='footer-line'>
                            <FacebookIcon style={{ width: 24, height: 24 }} />
                            <p>Facebook</p>
                        </a>
                    </li>
                    <li>
                        <a href='https://www.instagram.com/cia_polytech_paris_saclay/' target='_blank' rel='noreferrer' className='footer-line'>
                            <InstagramIcon style={{ width: 24, height: 24 }} />
                            <p>Instagram</p>
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}
