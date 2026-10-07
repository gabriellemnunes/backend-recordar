# Recordar — API (back-end)

API REST do Recordar (Saúde na Palma da Mão): clínicas, especialidades, médicos, pacientes, consultas e remédios.
Node.js + Express + MongoDB (Mongoose). Login com JWT, senha guardada com bcrypt.

Documentação interativa (Swagger): http://localhost:3000/api-docs

## Autenticação e autorização

- **Autenticação:** `POST /api/auth/login` confere e-mail e senha e devolve um token JWT (vale 8 horas). As outras rotas pedem o cabeçalho `Authorization: Bearer <token>`.
- **Autorização:** cada conta tem um `tipo` (`paciente`, `medico` ou `administrador`). O middleware `authorize` libera a rota só para os tipos permitidos, e os controllers conferem o dono do registro (um médico só mexe nas consultas e nos remédios dele, um paciente só nas consultas dele).
- A senha é guardada só como hash (bcrypt) e nunca aparece em nenhuma resposta.
- A conta de administrador não é criada pelo aplicativo: o servidor a cria ao ligar, com `ADMIN_EMAIL` e `ADMIN_SENHA` do `.env`.
- **Recuperar senha:** sem serviço de e-mail, a pessoa confirma um dado do cadastro (paciente: data de nascimento; médico: CRM) e cria a nova senha. A conta de administrador não é recuperada pelo aplicativo.
- Rotas abertas (sem token): registro, login, recuperação de senha e as listas de clínicas e especialidades, que o cadastro do médico precisa mostrar antes do login.

## Como o sistema funciona

1. O **administrador** cadastra as **especialidades** e as **clínicas**.
2. O **médico** cria a conta escolhendo a especialidade e as clínicas onde atende (a associação pode ser mudada depois no Perfil, ou pelo administrador).
3. O médico cria **consultas** com clínica, dia e horário: é a disponibilidade dele. Elas nascem `disponivel`.
4. O **paciente** escolhe clínica, especialidade e profissional, depois o dia e o horário, e preenche a anamnese. A consulta vira `agendada`.
5. O médico vê o paciente em "Pacientes", lê a anamnese e receita **remédios** nessa consulta.
6. Os remédios aparecem na aba Remédios e na Agenda do dia do paciente.
7. O administrador gerencia usuários, clínicas, especialidades e consultas.

## Rotas

| Tela | Método e rota | Quem | O que faz |
|---|---|---|---|
| Criar conta | `POST /api/auth/register` | aberta | Cria paciente ou médico e devolve o token |
| Login | `POST /api/auth/login` | aberta | Devolve token e dados do usuário |
| Recuperar senha | `POST /api/auth/recuperar-senha` | aberta | Cria nova senha conferindo data de nascimento (paciente) ou CRM (médico) |
| Perfil | `GET /api/users/me` | todos | Dados da própria conta |
| Editar meus dados | `PUT /api/users/me` | todos | Edita a própria conta (médico: especialidade e clínicas) |
| Deletar conta | `DELETE /api/users/me` | paciente, médico | Apaga a conta e o que depende dela |
| Usuários | `GET /api/users?tipo=&busca=` | administrador | Lista pacientes e médicos |
| Usuários | `GET /api/users/:id` | administrador | Detalhe do usuário |
| Usuários → Editar | `PUT /api/users/:id` | administrador | Edita o cadastro e a associação do médico com clínicas |
| Usuários → Deletar | `DELETE /api/users/:id` | administrador | Apaga a conta e o que depende dela |
| Clínicas (lista e pesquisa) | `GET /api/clinicas?busca=` | aberta | Busca por nome ou endereço |
| Clínicas | `GET /api/clinicas/:id` | aberta | Uma clínica |
| Clínicas → Cadastrar | `POST /api/clinicas` | administrador | Cadastra |
| Clínicas → Editar | `PUT /api/clinicas/:id` | administrador | Edita |
| Clínicas → Excluir | `DELETE /api/clinicas/:id` | administrador | Exclui, se não estiver em uso |
| Especialidades | `GET /api/especialidades?busca=` | aberta | Lista |
| Especialidades → Cadastrar | `POST /api/especialidades` | administrador | Cadastra |
| Especialidades → Editar | `PUT /api/especialidades/:id` | administrador | Edita |
| Especialidades → Excluir | `DELETE /api/especialidades/:id` | administrador | Exclui, se nenhum médico usa |
| Marcar consulta (profissionais) | `GET /api/medicos?nome=&clinica=&especialidade=` | todos | Profissionais por nome, clínica ou especialidade |
| Criar consulta | `POST /api/consultas` | médico | Cria disponibilidade (clínica, dia, horário) |
| Marcar consulta (horários) | `GET /api/consultas/disponiveis?clinica=&especialidade=&medico=&data=` | paciente | Dias e horários livres |
| Anamnese → Concluir | `PUT /api/consultas/:id/agendar` | paciente | Marca a consulta com a anamnese |
| Próximas consultas / Início do médico / Consultas do admin | `GET /api/consultas?status=` | todos | Cada um vê só o que é seu; admin vê todas |
| Consulta | `GET /api/consultas/:id` | paciente e médico da consulta, administrador | Detalhe (anamnese só para paciente e médico) |
| Pacientes | `GET /api/consultas/meus-pacientes?busca=` | médico | Pacientes com consulta agendada com ele |
| Cancelar consulta | `PUT /api/consultas/:id/cancelar` | paciente e médico da consulta, administrador | Consulta volta a ficar disponível |
| Excluir consulta | `DELETE /api/consultas/:id` | médico dono, administrador | Apaga a consulta |
| Adicionar remédio | `POST /api/remedios` | médico | Receita em uma consulta agendada dele |
| Remédios / Agenda do dia | `GET /api/remedios?consulta=&paciente=` | todos | Paciente vê os dele, por horário |
| Agenda do dia (marcar) | `PUT /api/remedios/:id/tomar` | paciente | Marca ou desmarca o remédio como tomado hoje |
| Editar remédio | `PUT /api/remedios/:id` | médico que receitou | Edita |
| Excluir remédio | `DELETE /api/remedios/:id` | médico que receitou, administrador | Apaga |

## Nomes dos campos

- Clínica: `nome_clinica`, `endereco_clinica`, `telefone_clinica`
- Especialidade: `nome_especialidade`
- Paciente: `nome_paciente`, `data_nascimento` (AAAA-MM-DD), `idade`, `telefone`, `email`
- Médico: `nome_medico`, `crm`, `id_especialidade`, `nome_especialidade`, `clinicas` (lista de clínicas), `telefone`, `email`
  - ao enviar: `id_especialidade` (ID) e `clinicas` (lista de IDs)
- Consulta: `data_consulta` (AAAA-MM-DD), `horario_consulta` (HH:MM), `status`, `id_clinica`, `nome_clinica`, `endereco_clinica`, `id_medico`, `nome_medico`, `nome_especialidade`, `id_paciente`, `nome_paciente`, `idade_paciente`, `anamnese`
  - ao criar: `id_clinica`, `data_consulta`, `horario_consulta`
- Anamnese: `queixa_principal`, `sintomas`, `inicio_sintomas`, `condicoes_saude`, `alergias`, `medicamentos_em_uso`
- Remédio: `nome_remedio`, `horario_remedio` (HH:MM), `quantidade_remedio`, `tomado_hoje`, `id_consulta`, `nome_medico`, `nome_paciente`

## Códigos de resposta

`200` certo · `201` criado · `400` dado faltando ou inválido · `401` sem login ou token vencido · `403` logado, mas sem permissão · `404` não encontrado · `409` conflito (e-mail, clínica ou horário repetido, registro em uso)

## O que acontece ao excluir

| Ação | Efeito |
|---|---|
| Deletar paciente | Os remédios dele são apagados. As consultas que ele marcou voltam a ficar disponíveis. |
| Deletar médico | Todas as consultas dele e os remédios que receitou são apagados. |
| Cancelar consulta | Ela volta a ficar disponível, a anamnese é limpa e os remédios receitados nela são apagados. |
| Excluir consulta | A consulta e os remédios receitados nela são apagados. |
| Excluir clínica | Só é permitido sem médicos associados e sem consultas (senão responde 409). |
| Excluir especialidade | Só é permitido se nenhum médico usa (senão responde 409). |
| Médico desmarca uma clínica | Só é permitido se ele não tem consultas criadas nela. |
| Conta deletada | O token para de funcionar na hora. |

## Estrutura

```
src/
├── server.js            monta as rotas, conecta no banco, cria o administrador e sobe o servidor
├── config/              swagger (documentação), format (campos de saída), datas, vinculos
├── controllers/         auth, user, clinica, especialidade, consulta, remedio
├── middlewares/         authMiddleware (token e tipo), errorHandler, asyncHandler
├── models/              User, Clinic, Specialty, Appointment, Medication
└── routes/              uma por recurso; aqui fica quem pode chamar cada rota
```
