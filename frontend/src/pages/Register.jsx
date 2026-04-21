import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { registerRequest } from "../services/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErro("");

  if (password !== confirmPassword) {
    setErro("As passwords não coincidem");
    return;
  }

  try {
    await registerRequest(email, password);
    navigate("/login");
  } catch (error) {
    setErro(error.message || "Erro de ligação ao servidor");
  }
};

  return (
    <div className="min-h-screen flex justify-center focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="p-8 w-full max-w-lg">
        <div className=" flex flex-col items-center inset-x-0 top-0 outline-2 outline-gray-300">
          <div className="bg-[#1C6E8C] rounded-xl w-16 h-16 mb-4 items-center justify-center flex">
            <h2 className="text-[26px] font-bold text-center text-gray-800 text-white">
              E
            </h2>
          </div>
          <h1 className="text-2xl mb-2 font-bold text-center text-gray-800">
            Ent'Artes
          </h1>
          <p className=" text-center text-gray-500 mb-6">
            Sistema de Gestão de Escola de Dança
          </p>
        </div>
        <div className="border shadow-xl rounded-xl bg-white p-8">
          <h1 className="text-2xl font-semibold text-top text-gray-800 mb-2">
            Criar palavra-passe para a sua conta
          </h1>
          <p className="text-gray-500 text-sm mb-4">
            Preencha os dados para poder acessar a sua conta.
          </p>
          <p className="text-gray-500 text-sm mb-4">
                      Se não tem conta por favor contacte a Ent'Artes para criar uma conta para si.
          </p>
          {erro && (
            <p className="text-red-500 text-sm text-center mb-4">{erro}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <p className="text-gray-700 text-sm font-medium mb-2">Email</p>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 text-sm font-medium mb-2">Senha</p>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-gray-700 text-sm font-medium mb-2">
                {" "}
                Confirmar Senha
              </p>
              <input
                type="password"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <p className="text-gray-700 text-sm font-normal mb-2">
                Concordo com os{" "}
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Termos de Serviço
                </span>{" "}
                e{" "}
                <span className="text-blue-500 cursor-pointer hover:underline">
                  Política de Privacidade
                </span>
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#1C6E8C] text-white justify-center py-3 rounded-md flex items-center gap-2 hover:bg-teal-700 transition-colors"
            >
              <UserPlus size={18} />
              Criar Conta
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-8">
            Já tem uma conta?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              Entrar
            </span>
          </p>
        </div>
        <footer className="w-full max-w-md mt-8">
          <p className="text-center text-gray-500 text-sm mt-8">
            &copy; 2026 Ent'Artes. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Register;
