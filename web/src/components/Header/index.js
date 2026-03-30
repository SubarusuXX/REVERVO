const Header = () => {
    return (
        <header className="container-fluid d-flex justify-content-end">
            <div className="d-flex aling-items-center">
                <div>
                    <span className="d-block m-0 p-0 text-white">Barbearia Olimpo</span>
                    <small className="m-0 p-0">Plano Gold</small>
                </div>
                <img src="https://th.bing.com/th/id/OIP.ICN7tbGaRZOKqJoeXZSEhAHaEW?w=272&h=180&c=7&r=0&o=7&pid=1.7&rm=3" alt="foto barbearia logo"/>
                <span className="mdi mdi-chevron-down text-white"></span>
            </div>
        </header>
    )
}

export default Header;