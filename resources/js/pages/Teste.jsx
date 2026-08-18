export default function Teste({ mensagem }) {
    return (
        <div className="container py-5">
            <div className="alert alert-success" role="alert">
                {mensagem}
            </div>
        </div>
    );
}
