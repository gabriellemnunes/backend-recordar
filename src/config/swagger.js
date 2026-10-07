const swaggerSpec = {
  "openapi": "3.0.0",
  "info": {
    "title": "Recordar API",
    "version": "3.0.0",
    "description": "API acadêmica da plataforma Recordar: clínicas, especialidades, médicos, pacientes, consultas e remédios."
  },
  "servers": [
    {
      "url": "http://localhost:3000"
    }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
      }
    },
    "schemas": {
      "PacienteInput": {
        "type": "object",
        "required": [
          "tipo",
          "nome_paciente",
          "data_nascimento",
          "email",
          "senha"
        ],
        "properties": {
          "tipo": {
            "type": "string",
            "enum": [
              "paciente"
            ]
          },
          "nome_paciente": {
            "type": "string"
          },
          "data_nascimento": {
            "type": "string",
            "example": "1953-03-12"
          },
          "telefone": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "senha": {
            "type": "string"
          },
          "confirmar_senha": {
            "type": "string"
          }
        }
      },
      "MedicoInput": {
        "type": "object",
        "required": [
          "tipo",
          "nome_medico",
          "crm",
          "id_especialidade",
          "email",
          "senha"
        ],
        "properties": {
          "tipo": {
            "type": "string",
            "enum": [
              "medico"
            ]
          },
          "nome_medico": {
            "type": "string"
          },
          "crm": {
            "type": "string"
          },
          "id_especialidade": {
            "type": "string",
            "description": "ID de uma especialidade cadastrada"
          },
          "clinicas": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "IDs das clínicas onde atende"
          },
          "telefone": {
            "type": "string"
          },
          "email": {
            "type": "string"
          },
          "senha": {
            "type": "string"
          },
          "confirmar_senha": {
            "type": "string"
          }
        }
      },
      "ClinicaInput": {
        "type": "object",
        "required": [
          "nome_clinica"
        ],
        "properties": {
          "nome_clinica": {
            "type": "string",
            "example": "Clínica Vida"
          },
          "endereco_clinica": {
            "type": "string",
            "example": "Rua das Flores, 120 - Centro"
          },
          "telefone_clinica": {
            "type": "string",
            "example": "(11) 3000-1000"
          }
        }
      },
      "Anamnese": {
        "type": "object",
        "required": [
          "queixa_principal"
        ],
        "properties": {
          "queixa_principal": {
            "type": "string"
          },
          "sintomas": {
            "type": "string"
          },
          "inicio_sintomas": {
            "type": "string"
          },
          "condicoes_saude": {
            "type": "string"
          },
          "alergias": {
            "type": "string"
          },
          "medicamentos_em_uso": {
            "type": "string"
          }
        }
      }
    }
  },
  "security": [
    {
      "bearerAuth": []
    }
  ],
  "paths": {
    "/api/auth/register": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Cria conta de paciente ou de médico e já devolve o token",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "oneOf": [
                  {
                    "$ref": "#/components/schemas/PacienteInput"
                  },
                  {
                    "$ref": "#/components/schemas/MedicoInput"
                  }
                ]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Conta criada"
          },
          "409": {
            "description": "E-mail já cadastrado"
          }
        }
      }
    },
    "/api/auth/login": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Realiza login",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "email",
                  "senha"
                ],
                "properties": {
                  "email": {
                    "type": "string"
                  },
                  "senha": {
                    "type": "string"
                  },
                  "tipo": {
                    "type": "string",
                    "enum": [
                      "paciente",
                      "medico",
                      "administrador"
                    ],
                    "description": "Opcional. Recusa o login se a conta for de outro tipo."
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login realizado"
          },
          "401": {
            "description": "E-mail ou senha inválidos"
          }
        }
      }
    },
    "/api/auth/recuperar-senha": {
      "post": {
        "tags": [
          "Auth"
        ],
        "summary": "Cria uma nova senha conferindo um dado do cadastro (paciente informa data_nascimento, médico informa crm)",
        "security": [],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "tipo",
                  "email",
                  "nova_senha"
                ],
                "properties": {
                  "tipo": {
                    "type": "string",
                    "enum": [
                      "paciente",
                      "medico"
                    ]
                  },
                  "email": {
                    "type": "string"
                  },
                  "data_nascimento": {
                    "type": "string",
                    "example": "1953-03-12",
                    "description": "Obrigatório para paciente"
                  },
                  "crm": {
                    "type": "string",
                    "description": "Obrigatório para médico"
                  },
                  "nova_senha": {
                    "type": "string"
                  },
                  "confirmar_senha": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Senha alterada"
          },
          "400": {
            "description": "Dados não conferem ou senha inválida"
          }
        }
      }
    },
    "/api/remedios/{id}/tomar": {
      "put": {
        "tags": [
          "Remédios"
        ],
        "summary": "Paciente marca ou desmarca o remédio como tomado hoje",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "tomado": {
                    "type": "boolean",
                    "example": true
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Remédio atualizado",
            "com tomado_hoje": null
          }
        }
      }
    },
    "/api/users/me": {
      "get": {
        "tags": [
          "Users"
        ],
        "summary": "Dados da própria conta (Perfil)",
        "responses": {
          "200": {
            "description": "Dados do usuário",
            "sem senha": null
          }
        }
      },
      "put": {
        "tags": [
          "Users"
        ],
        "summary": "Edita a própria conta",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nome_paciente": {
                    "type": "string"
                  },
                  "nome_medico": {
                    "type": "string"
                  },
                  "data_nascimento": {
                    "type": "string",
                    "example": "1953-03-12"
                  },
                  "telefone": {
                    "type": "string"
                  },
                  "email": {
                    "type": "string"
                  },
                  "crm": {
                    "type": "string"
                  },
                  "id_especialidade": {
                    "type": "string",
                    "description": "ID da especialidade (médico)"
                  },
                  "clinicas": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    },
                    "description": "IDs das clínicas onde atende (médico)"
                  },
                  "senha": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Conta atualizada"
          }
        }
      },
      "delete": {
        "tags": [
          "Users"
        ],
        "summary": "Deleta a própria conta (paciente ou médico) e tudo que depende dela",
        "responses": {
          "200": {
            "description": "Conta deletada"
          }
        }
      }
    },
    "/api/users": {
      "get": {
        "tags": [
          "Users"
        ],
        "summary": "Lista pacientes e médicos (administrador)",
        "parameters": [
          {
            "in": "query",
            "name": "tipo",
            "schema": {
              "type": "string",
              "enum": [
                "paciente",
                "medico"
              ]
            }
          },
          {
            "in": "query",
            "name": "busca",
            "schema": {
              "type": "string"
            },
            "description": "Parte do nome"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de usuários"
          }
        }
      }
    },
    "/api/users/{id}": {
      "get": {
        "tags": [
          "Users"
        ],
        "summary": "Detalhe de um usuário (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Usuário encontrado"
          }
        }
      },
      "put": {
        "tags": [
          "Users"
        ],
        "summary": "Edita o cadastro de um paciente ou médico, inclusive especialidade e clínicas (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nome_paciente": {
                    "type": "string"
                  },
                  "nome_medico": {
                    "type": "string"
                  },
                  "telefone": {
                    "type": "string"
                  },
                  "crm": {
                    "type": "string"
                  },
                  "id_especialidade": {
                    "type": "string"
                  },
                  "clinicas": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Cadastro atualizado"
          }
        }
      },
      "delete": {
        "tags": [
          "Users"
        ],
        "summary": "Deleta um paciente ou médico (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Usuário deletado"
          }
        }
      }
    },
    "/api/consultas": {
      "get": {
        "tags": [
          "Consultas"
        ],
        "summary": "Lista consultas (paciente vê as que marcou, médico vê as dele, administrador vê todas)",
        "parameters": [
          {
            "in": "query",
            "name": "status",
            "schema": {
              "type": "string",
              "enum": [
                "disponivel",
                "agendada"
              ]
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de consultas"
          }
        }
      },
      "post": {
        "tags": [
          "Consultas"
        ],
        "summary": "Médico cria uma consulta disponível",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "id_clinica",
                  "data_consulta",
                  "horario_consulta"
                ],
                "properties": {
                  "id_clinica": {
                    "type": "string",
                    "description": "Uma das clínicas do médico"
                  },
                  "data_consulta": {
                    "type": "string",
                    "example": "2026-10-20"
                  },
                  "horario_consulta": {
                    "type": "string",
                    "example": "14:30"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Consulta criada"
          },
          "409": {
            "description": "Já existe consulta nesse dia e horário"
          }
        }
      }
    },
    "/api/consultas/disponiveis": {
      "get": {
        "tags": [
          "Consultas"
        ],
        "summary": "Dias e horários livres para o paciente marcar",
        "parameters": [
          {
            "in": "query",
            "name": "clinica",
            "schema": {
              "type": "string"
            },
            "description": "ID da clínica"
          },
          {
            "in": "query",
            "name": "especialidade",
            "schema": {
              "type": "string"
            },
            "description": "ID da especialidade"
          },
          {
            "in": "query",
            "name": "medico",
            "schema": {
              "type": "string"
            },
            "description": "ID do médico"
          },
          {
            "in": "query",
            "name": "data",
            "schema": {
              "type": "string"
            },
            "description": "AAAA-MM-DD"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de consultas disponíveis"
          }
        }
      }
    },
    "/api/consultas/meus-pacientes": {
      "get": {
        "tags": [
          "Consultas"
        ],
        "summary": "Pacientes com consulta agendada com o médico logado",
        "parameters": [
          {
            "in": "query",
            "name": "busca",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de pacientes"
          }
        }
      }
    },
    "/api/consultas/{id}": {
      "get": {
        "tags": [
          "Consultas"
        ],
        "summary": "Detalhe da consulta (com anamnese para paciente e médico da consulta)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Consulta encontrada"
          }
        }
      },
      "delete": {
        "tags": [
          "Consultas"
        ],
        "summary": "Exclui a consulta e os remédios dela (médico dono ou administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Consulta excluída"
          }
        }
      }
    },
    "/api/consultas/{id}/agendar": {
      "put": {
        "tags": [
          "Consultas"
        ],
        "summary": "Paciente marca a consulta enviando a anamnese",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/Anamnese"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Consulta agendada"
          },
          "409": {
            "description": "Consulta não está mais disponível"
          }
        }
      }
    },
    "/api/consultas/{id}/cancelar": {
      "put": {
        "tags": [
          "Consultas"
        ],
        "summary": "Cancela a consulta (ela volta a ficar disponível e os remédios dela são apagados)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Consulta cancelada"
          }
        }
      }
    },
    "/api/remedios": {
      "get": {
        "tags": [
          "Remédios"
        ],
        "summary": "Lista remédios (paciente vê os dele, médico vê os que receitou, administrador vê todos)",
        "parameters": [
          {
            "in": "query",
            "name": "consulta",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "paciente",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de remédios por horário"
          }
        }
      },
      "post": {
        "tags": [
          "Remédios"
        ],
        "summary": "Médico receita um remédio em uma consulta agendada",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "id_consulta",
                  "nome_remedio",
                  "horario_remedio",
                  "quantidade_remedio"
                ],
                "properties": {
                  "id_consulta": {
                    "type": "string"
                  },
                  "nome_remedio": {
                    "type": "string",
                    "example": "Losartana 50 mg"
                  },
                  "horario_remedio": {
                    "type": "string",
                    "example": "09:00"
                  },
                  "quantidade_remedio": {
                    "type": "string",
                    "example": "1 comprimido"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Remédio criado"
          }
        }
      }
    },
    "/api/remedios/{id}": {
      "put": {
        "tags": [
          "Remédios"
        ],
        "summary": "Médico edita um remédio que receitou",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nome_remedio": {
                    "type": "string"
                  },
                  "horario_remedio": {
                    "type": "string"
                  },
                  "quantidade_remedio": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Remédio atualizado"
          }
        }
      },
      "delete": {
        "tags": [
          "Remédios"
        ],
        "summary": "Exclui um remédio (médico que receitou ou administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Remédio excluído"
          }
        }
      }
    },
    "/api/clinicas": {
      "get": {
        "tags": [
          "Clínicas"
        ],
        "summary": "Lista e pesquisa clínicas (aberta)",
        "security": [],
        "parameters": [
          {
            "in": "query",
            "name": "busca",
            "schema": {
              "type": "string"
            },
            "description": "Parte do nome ou do endereço"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de clínicas"
          }
        }
      },
      "post": {
        "tags": [
          "Clínicas"
        ],
        "summary": "Cadastra clínica (administrador)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ClinicaInput"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Clínica cadastrada"
          },
          "409": {
            "description": "Já existe uma clínica com esse nome"
          }
        }
      }
    },
    "/api/clinicas/{id}": {
      "get": {
        "tags": [
          "Clínicas"
        ],
        "summary": "Consulta uma clínica (aberta)",
        "security": [],
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Clínica encontrada"
          }
        }
      },
      "put": {
        "tags": [
          "Clínicas"
        ],
        "summary": "Edita clínica (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ClinicaInput"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Clínica atualizada"
          }
        }
      },
      "delete": {
        "tags": [
          "Clínicas"
        ],
        "summary": "Exclui clínica sem médicos associados e sem consultas (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Clínica excluída"
          },
          "409": {
            "description": "Clínica em uso"
          }
        }
      }
    },
    "/api/especialidades": {
      "get": {
        "tags": [
          "Especialidades"
        ],
        "summary": "Lista especialidades (aberta)",
        "security": [],
        "parameters": [
          {
            "in": "query",
            "name": "busca",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de especialidades"
          }
        }
      },
      "post": {
        "tags": [
          "Especialidades"
        ],
        "summary": "Cadastra especialidade (administrador)",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": [
                  "nome_especialidade"
                ],
                "properties": {
                  "nome_especialidade": {
                    "type": "string",
                    "example": "Cardiologia"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Especialidade cadastrada"
          },
          "409": {
            "description": "Especialidade já cadastrada"
          }
        }
      }
    },
    "/api/especialidades/{id}": {
      "put": {
        "tags": [
          "Especialidades"
        ],
        "summary": "Edita especialidade (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "nome_especialidade": {
                    "type": "string"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Especialidade atualizada"
          }
        }
      },
      "delete": {
        "tags": [
          "Especialidades"
        ],
        "summary": "Exclui especialidade que nenhum médico usa (administrador)",
        "parameters": [
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Especialidade excluída"
          },
          "409": {
            "description": "Especialidade em uso"
          }
        }
      }
    },
    "/api/medicos": {
      "get": {
        "tags": [
          "Médicos"
        ],
        "summary": "Consulta profissionais por nome, clínica ou especialidade (qualquer usuário logado)",
        "parameters": [
          {
            "in": "query",
            "name": "nome",
            "schema": {
              "type": "string"
            }
          },
          {
            "in": "query",
            "name": "clinica",
            "schema": {
              "type": "string"
            },
            "description": "ID da clínica"
          },
          {
            "in": "query",
            "name": "especialidade",
            "schema": {
              "type": "string"
            },
            "description": "ID da especialidade"
          }
        ],
        "responses": {
          "200": {
            "description": "Lista de médicos com especialidade e clínicas"
          }
        }
      }
    }
  },
  "tags": []
};

module.exports = swaggerSpec;
