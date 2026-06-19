DOENCAS = {
    "cao": {
        "parvovirose": {
            "nome": "Parvovirose Canina",
            "descricao": "Doença viral altamente contagiosa que afeta o sistema gastrointestinal",
            "sintomas": {
                "sangue_fezes": {
                    "peso":40,
                    "nivel": "ALTA",
                    "descricao": "Diarreia com sangue"
                },
                "vomitos": {
                    "peso": 25,
                    "nivel": "ALTA",
                    "descricao": "Vômitos frequentes"
                },
                "apatia":{
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Apatia e prostração"
                },
                "desidratado": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Sinais de desidratação"
                },
                "febre": {
                    "peso": 10,
                    "nivel": "MÉDIA",
                    "descricao": "Febre"
                },
                "falta_apetite": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Falta de apetite"
                },
                "dor": {
                    "peso": 5,
                    "nivel": "BAIXA",
                    "descricao": "Dor abdominal"
                }
            },
            "fatores_risco": {
                "idade_filhote": {
                    "peso": 20,
                    "descricao": "Menos de 6 meses"
                },
                "vacinacao_incompleta": {
                    "peso": -10,
                    "descricao": "Vacinação incompleta"
                },
                "vacinacao_completa": {
                    "peso": -35,
                    "descricao": "Vacinação completa"
                }
            },
            "urgencia": {
                "critico": ["sangue_fezes", "vomitos", "desidratado"],
                "nivel": "Alta - Requer atendimento urgente"
            }
        },

        "cinomose": {
            "nome": "Cinomose Canina",
            "descricao": "Doença viral altamente contagiosa que afete sistemas respiratório, gastrointestinal e neurológico",
            "sintomas": {
                "secrecao_ocular": {
                    "peso": 40,
                    "nivel": "ALTA",
                    "descricao": "Secreção ocular purulenta (remela espessa)"
                },
                "secrecao_nasal": {
                    "peso": 40,
                    "nivel": "ALTA",
                    "descricao": "Secreção nasal purulenta"
                },
                "convulsoes": {
                    "peso": 50,
                    "nivel": "ALTA",
                    "descricao": "Convulsões ou tremores musculares"
                },
                "tosse": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Tosse e espirros"
                },
                "vomitos": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Vômitos"
                },
                "diarreia": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Diarreia"
                },
                "febre": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Febre bifásica"
                },
                "apatia": {
                    "peso": 10,
                    "nivel": "MÉDIA",
                    "descricao": "Apatia e fraqueza"
                }
            },
            "fatores_risco": {
                "vacinacao_incompleta": {
                    "peso": -10,
                    "descricao": "Vacinação incompleta"
                },
                "vacinacao_completa": {
                    "peso": -35,
                    "descricao": "Vacinação completa"
                }
            },
            "urgencia": {
                "critico": ["convulsoes", "secrecao_ocular", "secrecao_nasal"],
                "nivel": "Crítica - Emergência neurológica possível"
            }
        },

        "erliquiose": {
            "nome": "Erliquiose Canina",
            "descricao": "Hemoparasitose transmitida por carrapatos, afeta as plaquetas e pode levar à falência de orgãos.",
            "sintomas": {
                "sangramento_espontaneo": {
                    "peso": 50,
                    "nivel": "ALTA",
                    "descricao": "Sangramento nasal espontâneo ou hematomas"
                },
                "apatia_extrema": {
                    "peso": 25,
                    "nivel": "ALTA",
                    "descricao": "Letargia extrema e fraqueza generalizada"
                },
                "febre": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Febre repentina"
                },
                "linfonodos_aumentados": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Linfonodos aumentados e doloridos"
                },
                "mancar": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Claudicação (ato de mancar) em membros"
                },
                "perda_petite": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Perda de apetite progressiva"
                },
                "tosse": {
                    "peso": 10,
                    "nivel": "BAIXA",
                    "descricao": "Tosse ocasional"
                }
            },
            "fatores_risco": {
                "exposicao_carrapato": {
                    "peso": 30,
                    "descricao": "Histórico de exposição a carrapatos"
                }
            },
            "urgencia": {
                "critico": ["sangramento_espontaneo", "apatia_extrema"],
                "nivel": "Alta - Requer testes sanguíneos urgentemente"
            }
        }
    },

    "gato": {
        "obtrucao_urinaria": {
            "nome": "Obstrução Urinária Felina",
            "descricao": "Emergência veterinária potencialmente fatal onde o gato não consegue urinar, levando à morte em 36-48h",
            "sintomas": {
                "nao_consegue_urinar": {
                    "peso": 60,
                    "nivel": "ALTA",
                    "descricao": "Tenta urinar sem produzir urina (anúria)"
                },
                "bexiga_distendida": {
                    "peso": 55,
                    "nivel": "ALTA",
                    "descricao": "Bexiga distendida e dolorida à palpação"
                },
                "vomito": {
                    "peso": 35,
                    "nivel": "ALTA",
                    "descricao": "Vômito e hálito urêmico"
                },
                "vocalizacao_dor": {
                    "peso": 30,
                    "nivel": "MÉDIA",
                    "descricao": "Vocalização ao tentar urinar (choro de dor)"
                },
                "hematuria": {
                    "peso": 25,
                    "nivel": "MÉDIA",
                    "descricao": "Sangue na urina"
                },
                "polaquiuria": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Tentativas frequentes de urinar com pouca urina"
                },
                "apatia": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Apatia e prostração"
                }
            },
            "fatores_risco": {
                "macho": {
                    "peso": 20,
                    "descricao": "Gato macho (mais suscetível)"
                }
            },
            "urgencia": {
                "critico": ["nao_consegue_urinar", "vomito"],
                "nivel": "EMERGÊNCIA VITAL - Morte possível em 36-48h se não for tratado"
            }
        },

        "infeccao_urinaria": {
            "nome": "Infecção Urinária Felina",
            "descricao": "Inflamação/infecção do trato urinário, menos grave que a obstrução, porém requer tratamento",
            "sintomas": {
                "polaquiuria": {
                    "peso": 25,
                    "nivel": "ALTA",
                    "descricao": "Micções frequentes e dolorosas"
                },
                "hematuria": {
                    "peso": 20,
                    "nivel": "ALTA",
                    "descricao": "Sangue na urina"
                },
                "vocalizacao_leve": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Leve vocalização ao urinar"
                },
                "lambedura_genital": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Lambedura excessiva na genital"
                },
                "urinar_local_incomum": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Urinar fora da caixa de areia"
                },
                "apatia_leve": {
                    "peso": 10,
                    "nivel": "BAIXA",
                    "descricao": "Apatia leve"
                }
            },
            "fatores_risco": {
                "femea": {
                    "peso": 10,
                    "descricao": "Gato fêmea (mais suscetível)"
                }
            },
            "urgencia": {
                "critico": ["polaquiuria", "hematuria"],
                "nivel": "Média - Requer avaliação clínica"
            }
        },

        "gastroenterite": {
            "nome": "Gastroenterite Felina",
            "descricao": "Inflamação do trato gastrointestinal, pode pode ter várias causas",
            "sintomas": {
                "vomito": {
                    "peso":30,
                    "nivel": "ALTA",
                    "descricao": "Vômito frequente"
                },
                "perda_apetite": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Perda de apetite"
                },
                "apatia": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Apatia"
                },
                "desidratacao": {
                    "peso": 20,
                    "nivel": "MÉDIA",
                    "descricao": "Sinais de desidratação"
                },
                "dor_abdominal": {
                    "peso": 15,
                    "nivel": "MÉDIA",
                    "descricao": "Dor abdominal"
                }
            },
            "fatores_risco": {},
            "urgencia": {
                "critico": ["vomito", "diarreia"],
                "nivel": "Média - Requer avaliação clínica e suporte"
            }
        }
    }
}

def obter_doencas_por_especie(especie):
    return DOENCAS.get(especie.lower(), {})

def obter_sintomas_por_especie(especie):
    doencas = obter_doencas_por_especie(especie)
    sintomas_dict = {}

    for doenca_nome, doenca_info in doencas.items():
        for sintoma_nome, sintoma_info in doenca_info["sintomas"].items():
            if sintoma_nome not in sintomas_dict:
                sintomas_dict[sintoma_nome] = {
                    "descricao": sintoma_info["descricao"],
                    "doencas": [doenca_nome]
                }
            else:
                sintomas_dict[sintoma_nome]["doencas"].append(doenca_nome)

    return sintomas_dict

def calcular_probabilidade_doenca(especie, sintomas_selecionados, fatores_risco):
    """
    Args:
        especie: "cao" ou "gato"
        sintomas_relacionados: dict com sintomas True/False
        fatores_risco: dict com fatores de risco True/False

    Returns:
        dict com probabilidade de cada doença
    """
    doencas = obter_doencas_por_especie(especie)
    resultados = {}

    for doenca_nome, doenca_info in doencas.items():
        probabilidade = 0
        sinais_positivos = []
        sinais_negativos = []

        #calcular por sintomas
        for sintoma_nome, sintoma_info in doenca_info["sintomas"].items():
            if sintomas_selecionados.get(sintoma_nome, False):
                probabilidade += sintoma_info["peso"]
                sinais_positivos.append(f"{sintoma_info['descricao']}")
            else:
                sinais_negativos.append(f"Sem {sintoma_info['descricao']}")
        #calcular por fator de risco
        for fator_nome, fator_info in doenca_info["fatores_risco"].items():
            if fatores_risco.get(fator_nome, False):
                probabilidade += fator_info["peso"]
                if fator_info["peso"] > 0:
                    sinais_positivos.append(f"{fator_info['descricao']}")

        probabilidade = max(0, min(probabilidade, 100))

        resultados[doenca_nome] = {
            "nome": doenca_info["nome"],
            "probabilidade": probabilidade,
            "sinais_positivos": sinais_positivos,
            "sinais_negativos": sinais_negativos,
            "urgencia": doenca_info["urgencia"]["nivel"],
            "criticos": doenca_info["urgencia"]["critico"]
        }
    #ordenar por probabilidades
    resultados_ordenados = dict(sorted(
        resultados.items(),
        key=lambda x: x[1]["probabilidade"],
        reverse=True
    ))

    return resultados_ordenados

def obter_confianca_diagnostico(sintomas_selecionados, doencas_resultado):
    if not sintomas_selecionados or not any(sintomas_selecionados.values()):
        return "Muito Baixa"

    total_sintomas = len([s for s in sintomas_selecionados.values() if s])

    if total_sintomas >= 4:
        return "Alta"
    elif total_sintomas >= 3:
        return "Moderada"
    else:
        return "Baixa"
