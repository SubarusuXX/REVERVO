import { useEffect } from "react";
import { Button, Drawer, Modal, DatePicker, Tag, Uploader } from "rsuite";
import WarningIcon from "@rsuite/icons/legacy/Warning";
import "rsuite/dist/rsuite.min.css";
import Table from "../../components/Table";
import moment from "moment";

import { useDispatch, useSelector } from "react-redux";
import {
  allServicos,
  updateServico,
  addServico,
  removeServico,
  removeArquivo,
  resetServico,
} from "../../store/modules/servico/actions";
import Icon from "@rsuite/icons/esm/Icon";


import consts from "../../consts";


const Servicos = () => {
  const dispatch = useDispatch();
  const { servicos, form, servico, behavior, components } = useSelector(
    (state) => state.servico,
  );

  const setComponent = (component, state) => {
    dispatch(
      updateServico({
        components: { ...components, [component]: state },
      }),
    );
  };

  const setServico = (key, value) => {
    dispatch(
      updateServico({
        servico: { ...servico, [key]: value },
      }),
    );
  };

  const save = () => {
    dispatch(addServico());
  };

  const remove = () => {
    dispatch(removeServico());
  };

  useEffect(() => {
    dispatch(allServicos());
  }, [dispatch]);

  return (
    <>
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponent("drawer", false)}
      >
        <Drawer.Body>
          <h3>{behavior === "create" ? "Criar novo" : "Atualizar"} Servico</h3>
          <div className="row mt-3">
            <div className="form-group col-6">
              <b className="">Título</b>
              <input
                type="text"
                className="form-control"
                placeholder="Titulo do serviço"
                value={servico.titulo}
                onChange={(e) => {
                  setServico("titulo", e.target.value);
                }}
              />
            </div>
            <div className="form-group col-3">
              <b className="">R$ Preço</b>
              <input
                type="number"
                className="form-control"
                placeholder="Preço do serviço"
                value={servico.preco}
                onChange={(e) => setServico("preco", e.target.value)}
              />
            </div>
            <div className="form-group col-3">
              <b className="">Recorr. (dias)</b>
              <input
                type="number"
                className="form-control"
                placeholder="Recorrência do serviço"
                value={servico.recorrencia}
                onChange={(e) => setServico("recorrencia", e.target.value)}
              />
            </div>
            <div className="form-group col-4">
              <b className="">% Comissão</b>
              <input
                type="number"
                className="form-control"
                placeholder="Comissão do serviço"
                value={servico.comissao}
                onChange={(e) => setServico("comissao", e.target.value)}
              />
            </div>
            <div className="form-group col-4">
              <b className="d-block">Duração</b>
              <DatePicker
                block
                format="HH:mm"
                value={servico.duracao}
                hideMinutes={(min) => ![0, 30].includes(min)}
                onChange={(e) => {
                  setServico("duracao", e);
                }}
              />
            </div>
            <div className="form-group col-4">
              <b className="">Status</b>
              <select
                className="form-control"
                value={servico.status}
                onChange={(e) => setServico("status", e.target.value)}
              >
                <option value="A">Ativo</option>
                <option value="I">Inativo</option>
              </select>
            </div>
            <div className="form-group col-12">
              <b className="">Descrição</b>
              <textarea
                rows="5"
                className="form-control"
                placeholder="Descrição do serviço..."
                value={servico.descricao}
                onChange={(e) => setServico("descricao", e.target.value)}
              ></textarea>
            </div>
            <div className="form-group col-12">
              <b className="d-block">Imagens do serviço</b>
              <Uploader
                multiple
                autoUpload={false}
                listType="picture"
                defaultFileList={(servico.arquivos || []).map((s, i) => ({
                  name: s?.caminho,
                  fileKey: i,
                  url: `${consts.bucketURL}/${s?.caminho}`,
                }))}
                onChange={(files) => {
                  const arquivos = files
                    .filter((f) => f.blobFile)
                    .map((f) => f.blobFile);

                  setServico("arquivos", arquivos);
                }}
                onRemove={(file) => {
                  if (behavior === "update" && file.url) {
                    dispatch(removeArquivo(file.name));
                  }
                }}
              ></Uploader>
              <Uploader>
                <button>
                  <Icon icon="camera-retro" size="lg" />
                </button>
              </Uploader>
            </div>
          </div>
          <Button
            loading={form.saving}
            color={behavior === 'create' ? 'green' : 'primary'}
            size="lg"
            block
            onClick={() => save()}
            className="mt-3"
          >
            {behavior === 'create' ? 'Salvar' : 'Atualizar'} Serviço
          </Button>
          {behavior === 'update' && (
            <Button
              loading={form.saving}
              color="red"
              size="lg"
              block
              onClick={() => setComponent('confirmDelete', true)}
              className="mt-1"
            >
              Remover Serviço
            </Button>
          )}

        </Drawer.Body>
      </Drawer>
      <div className="col p-5 overflow-auto h-100">
        <Modal
          open={components.confirmDelete}
          onClose={() => setComponent("confirmDelete", false)}
          size="xs"
        >
          <Modal.Body>
            <WarningIcon
              style={{
                color: "#ffb300",
                fontSize: 24,
              }}
            />
            {"  "} Tem certeza que deseja excluir? Essa ação será irreversível!
          </Modal.Body>
          <Modal.Footer>
            <Button loading={form.saving} onClick={() => remove()} color="red">
              Sim, tenho certeza!
            </Button>
            <Button
              onClick={() => setComponent("confirmDelete", false)}
              appearance="subtle"
            >
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="row">
          <div className="col-12">
            <div className="w-100 d-flex justify-content-between">
              <h2 className="mb-4 mt-0">Serviços</h2>
              <div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    dispatch(resetServico());
                    dispatch(
                      updateServico ({
                        behavior: "create",
                      })
                    );
                    setComponent("drawer", true);
                  }}
                >
                  <span className="mdi mdi-plus">Novo Servico</span>
                </button>
              </div>
            </div>
            <Table
              loading={form.filtering}
              data={servicos}
              config={[
                {
                  label: "Titulo",
                  key: "titulo",
                  sortable: true,
                  fixed: true,
                  width: 200,
                },
                {
                  label: "R$ Preço",
                  key: "preco",
                  content: (servico) => `R$ ${servico.preco.toFixed(2)}`,
                },
                {
                  label: "% Comissão",
                  key: "comissao",
                  content: (servico) => `${servico.comissao}%`,
                },
                {
                  label: "Recorrência (dias)",
                  key: "recorrencia",
                  content: (servico) => `${servico.recorrencia} dias`,
                },
                {
                  label: "Duração",
                  key: "duracao",
                  sortable: true,
                  content: (servico) => moment(servico.duracao).format("HH:mm"),
                },
                {
                  label: "Status",
                  key: "status",
                  content: (servico) => (
                    <Tag color={servico.status === "A" ? "green" : "red"}>
                      {servico.status === "A" ? "Ativo" : "Inativo"}
                    </Tag>
                  ),
                  sortable: true,
                },
              ]}
              actions={(servico) => (
                <Button appearance="primary" size="xs">
                  Ver informaçôes
                </Button>
              )}
              onRowClick={(servico) => {
                dispatch(
                  updateServico({
                    behavior: "update",
                  }),
                );
                dispatch(
                  updateServico({
                    servico,
                  }),
                );
                setComponent("drawer", true);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Servicos;
