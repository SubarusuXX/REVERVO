import { useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Drawer, TagPicker, DatePicker, Button, Modal } from "rsuite";
import WarningIcon from "@rsuite/icons/legacy/Warning";
import "rsuite/dist/rsuite.min.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  allHorarios,
  allServicos,
  updateHorario,
  filterColaboradores,
  addHorario,
  removeHorario,
} from "../../store/modules/horario/actions";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import "moment/locale/pt-br";
import { set } from "rsuite/esm/internals/utils/date";

moment.locale("pt-br");
const localizer = momentLocalizer(moment);

const Horarios = () => {
  const dispatch = useDispatch();
  const {
    horarios,
    horario,
    form,
    behavior,
    colaboradores,
    components,
    servicos,
  } = useSelector((state) => state.horario);

  const diasSemanaData = [
    new Date(2026, 3, 26, 0, 0, 0, 0),
    new Date(2026, 3, 27, 0, 0, 0, 0),
    new Date(2026, 3, 28, 0, 0, 0, 0),
    new Date(2026, 3, 29, 0, 0, 0, 0),
    new Date(2026, 3, 30, 0, 0, 0, 0),
    new Date(2026, 3, 31, 0, 0, 0, 0),
    new Date(2026, 4, 1, 0, 0, 0, 0),
  ];

  const diasDaSemana = [
    "domingo",
    "segunda-feira",
    "terça-feira",
    "quarta-feira",
    "quinta-feira",
    "sexta-feira",
    "sábado",
  ];

  const formatEventos = () => {
    return (horarios || [])
      .map((horario) =>
        horario.dias.map((dia) => ({
          resource: horario,
          title: `${horario.especialidades.length} espec. e ${horario.colaboradores.length} colab.`,
          start: new Date(
            new Date(diasSemanaData[dia]).setHours(
              parseInt(moment(horario.inicio, "HH:mm").format("HH")),
              parseInt(moment(horario.inicio, "HH:mm").format("mm")),
            ),
          ),
          end: new Date(
            new Date(diasSemanaData[dia]).setHours(
              parseInt(moment(horario.fim, "HH:mm").format("HH")),
              parseInt(moment(horario.fim, "HH:mm").format("mm")),
            ),
          ),
        })),
      )
      .flat();
  };
  const setComponent = (component, state) => {
    dispatch(
      updateHorario({
        components: { ...components, [component]: state },
      }),
    );
  };

  const setHorario = (key, value) => {
    dispatch(
      updateHorario({
        horario: { ...horario, [key]: value },
      }),
    );
  };

  const save = () => {
    dispatch(addHorario());
  };

  const remove = () => {
    dispatch(removeHorario());
  };

  useEffect(() => {
    dispatch(allHorarios());
    dispatch(allServicos());
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterColaboradores());
  }, [horario.especialidades]);

  return (
    <div className="col p-5 overflow-auto h-100">
      <Drawer
        open={components.drawer}
        size="sm"
        onClose={() => setComponent("drawer", false)}
      >
        <Drawer.Body>
          <h3>
            {behavior === "create" ? "Criar novo" : "Atualizar"} horario de
            atendimento
          </h3>
          <div className="row mt-3">
            <div className="col-12">
              <b>Dias da semana</b>
              <TagPicker
                size="lg"
                block
                value={horario.dias}
                data={diasDaSemana.map((label, value) => ({ label, value }))}
                onChange={(value) => {
                  setHorario("dias", value);
                }}
              />
            </div>
            <div className="col-6 mt-3">
              <b className="d-block">Horário Inicial</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => min % 30 !== 0}
                value={
                  horario.inicio
                    ? moment(horario.inicio, "HH:mm").toDate()
                    : null
                }
                onChange={(e) => {
                  setHorario("inicio", moment(e).format("HH:mm"));
                }}
              />
            </div>
            <div className="col-6 mt-3">
              <b className="d-block">Horário Final</b>
              <DatePicker
                block
                format="HH:mm"
                hideMinutes={(min) => min % 30 !== 0}
                value={
                  horario.fim ? moment(horario.fim, "HH:mm").toDate() : null
                }
                onChange={(e) => {
                  setHorario("fim", moment(e).format("HH:mm"));
                }}
              />
            </div>
            <div className="col-12 mt-3">
              <b>Especialidades disponíveis</b>
              <TagPicker
                size="lg"
                block
                data={servicos}
                value={horario.especialidades}
                onChange={(e) => {
                  setHorario("especialidades", e);
                }}
              />
            </div>
            <div className="col-12 mt-3">
              <b>Colaboradores disponíveis</b>
              <TagPicker
                size="lg"
                block
                data={colaboradores}
                value={horario.colaboradores}
                onChange={(e) => {
                  setHorario("colaboradores", e);
                }}
              />
            </div>
          </div>
          <Button
            loading={form.saving}
            color={behavior === "create" ? "green" : "primary"}
            size="lg"
            block
            onClick={() => save()}
            className="mt-3"
          >
            Salvar Horário de Atendimento
          </Button>
          {behavior === "update" && (
            <Button
              loading={form.saving}
              color="red"
              size="lg"
              block
              onClick={() => setComponent("confirmDelete", true)}
              className="mt-1"
            >
              Remover Horário de Atendimento
            </Button>
          )}
        </Drawer.Body>
      </Drawer>

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
            <h2 className="mb-4 mt-0">Horários de Atendimento</h2>
            <div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  dispatch(
                    updateHorario({
                      behavior: "create",
                      horario: {
                        dias: [],
                        inicio: null,
                        fim: null,
                        especialidades: [],
                        colaboradores: [],
                      },
                    }),
                  );

                  setComponent("drawer", true);
                }}
              >
                <span className="mdi mdi-plus">Novo Horário</span>
              </button>
            </div>
          </div>
          <Calendar
            selectable
            onSelectEvent={(e) => {
              dispatch(
                updateHorario({
                  behavior: "update",
                }),
              );
              dispatch(
                updateHorario({
                  horario: e.resource,
                }),
              );
              setComponent("drawer", true);
            }}
            onSelectSlot={(slotInfo) => {
              const { start, end } = slotInfo;

              dispatch(
                updateHorario({
                  behavior: "create",
                  horario: {
                    ...horario,
                    dias: [moment(start).day()],
                    inicio: moment(start).format("HH:mm"),
                    fim: moment(end).format("HH:mm"),
                  },
                }),
              );

              setComponent("drawer", true);
            }}
            localizer={localizer}
            toolbar={false}
            popup
            formats={{
              dateFormat: "dd",
              dayFormat: (date, culture, localizer) =>
                localizer.format(date, "dddd", culture),
            }}
            events={formatEventos()}
            date={diasSemanaData[moment().day()]}
            view="week"
            style={{ height: 600 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Horarios;
