import {
  ReactGrid,
  Column,
  OptionType,
  DefaultCellTypes,
  Row,
  HeaderCell,
  TextCell,
  NumberCell,
  CellChange,
  DropdownCell,
  type CellStyle,
} from "@silevis/reactgrid";
import { useEffect, useState } from "react";
import "@silevis/reactgrid/styles.css";
import "./App.css";

interface ProjectOption {
  id: string;
  name: string;
  function: string;
}

interface Project {
  projectId: string | null;
  percentage: number;
}

interface ManHourRow {
  id: string;
  employee: string;
  department: string;
  position: string;
  projects: Project[];
  assignee: string;
  status: string;
  updatedAt: string;
}

export const roleFunctionOptions: OptionType[] = [
  { value: "research", label: "研发" },
  { value: "operation", label: "运维" },
  { value: "sales", label: "销售" },
  { value: "management", label: "管理" },
];

interface ProjectOptionsMap {
  [manHourId: string]: ProjectOption[];
}

interface ProjectOptionsResponse {
  data: ProjectOptionsMap;
}

const getProjectOptions = async (
  manHourIds: string[]
): Promise<ProjectOptionsResponse> => {
  const optionsMap: ProjectOptionsMap = {
    "1": [
      { id: "general", name: "综合项目", function: "研发" },
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "manHourManagement", name: "工时管理", function: "研发" },
    ],
    "2": [
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "general", name: "综合项目", function: "研发" },
    ],
    "3": [
      { id: "userGrowth", name: "用户增长", function: "运维" },
      { id: "dataAnalysis", name: "数据分析", function: "研发" },
      { id: "infrastructure", name: "基础设施", function: "运维" },
    ],
  };

  await new Promise((resolve) => setTimeout(resolve, 100));

  const result: ProjectOptionsMap = {};
  manHourIds.forEach((id) => {
    if (optionsMap[id]) {
      result[id] = optionsMap[id];
    }
  });

  return { data: result };
};

const getManHours = async (): Promise<{ data: ManHourRow[] }> => {
  return {
    data: [
      {
        id: "1",
        employee: "张三",
        department: "效率工程——前端",
        position: "研发工程师",
        projects: [
          {
            projectId: "general",
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            percentage: 40,
          },
          {
            projectId: "manHourManagement",
            percentage: 30,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
      {
        id: "2",
        employee: "李四",
        department: "效率工程——服务端",
        position: "研发工程师",
        projects: [
          {
            projectId: "general",
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            percentage: 40,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
      {
        id: "3",
        employee: "王五",
        department: "效率工程——架构",
        position: "研发工程师",
        projects: [
          {
            projectId: "userGrowth",
            percentage: 40,
          },
        ],
        assignee: "李四",
        status: "进行中",
        updatedAt: "2021-01-01",
      },
    ],
  };
};

function getHeaderRow(maxNumProjects: number) {
  const headerCells: HeaderCell[] = [
    { type: "header", text: "员工" },
    { type: "header", text: "所属部门" },
    { type: "header", text: "岗位" },
  ];

  for (let i = 0; i < maxNumProjects; i++) {
    const projectGroupStyle = {
      background: `hsl(${(i * 120) % 360}, 70%, 90%)`,
    };

    headerCells.push(
      {
        type: "header",
        text: `项目${i + 1}`,
        style: projectGroupStyle as CellStyle,
      },
      {
        type: "header",
        text: "职能",
        style: projectGroupStyle as CellStyle,
      },
      {
        type: "header",
        text: "占比",
        style: projectGroupStyle as CellStyle,
      }
    );
  }

  headerCells.push(
    { type: "header", text: "填写人" },
    { type: "header", text: "填写状态" },
    { type: "header", text: "更新时间" },
    {
      type: "header",
      text: "百分比合计",
      style: { background: "#f5f5f5" } as CellStyle,
    }
  );

  return {
    rowId: "header",
    height: 35,
    cells: headerCells,
  };
}

const PERCENTAGE_FORMAT = new Intl.NumberFormat("zh-CN", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

interface DropdownState {
  [rowId: string]: {
    [projectIndex: string]: boolean;
  };
}

export const departments = [
  "效率工程——产品&测试——产品经理",
  "效率工程——服务端",
  "效率工程——前端",
  "效率工程——测试",
  "效率工程——运维",
  "效率工程——架构",
];

const DISABLED_STYLE = {
  backgroundColor: "#f5f5f5",
  color: "#999",
  borderColor: "#e0e0e0",
} as const;

const NON_EDITABLE_STYLE = {
  backgroundColor: "#fafafa",
  color: "#666",
} as const;

interface CreateProjectCellsParams {
  project: Project;
  manHourId: string;
  isOpen: boolean;
  projectOptionsMap: ProjectOptionsMap;
}

function createProjectCells({
  project,
  manHourId,
  isOpen,
  projectOptionsMap,
}: CreateProjectCellsParams): [DropdownCell, TextCell, NumberCell] {
  const options = projectOptionsMap[manHourId] || [];
  const selectedOption = options.find(
    (option: ProjectOption) => option.id === project.projectId
  );

  return [
    {
      type: "dropdown",
      selectedValue: project.projectId ?? "",
      values: options.map((option: ProjectOption) => ({
        value: option.id,
        label: option.name,
      })),
      isOpen,
      groupId: "project-name",
    },
    {
      type: "text",
      text: selectedOption?.function ?? "",
      nonEditable: true,
      style: NON_EDITABLE_STYLE,
      groupId: "project-function",
    },
    {
      type: "number",
      value: project.percentage / 100,
      format: PERCENTAGE_FORMAT,
      nanToZero: true,
      groupId: "project-percentage",
    },
  ];
}

function createEmptyCells(): [DropdownCell, TextCell, NumberCell] {
  return [
    {
      type: "dropdown",
      values: [],
      selectedValue: "",
      isOpen: false,
      isDisabled: true,
      style: DISABLED_STYLE,
      groupId: "project-name",
    },
    {
      type: "text",
      text: "-",
      nonEditable: true,
      style: DISABLED_STYLE,
      groupId: "project-function",
    },
    {
      type: "number",
      value: 0,
      format: PERCENTAGE_FORMAT,
      nonEditable: true,
      style: DISABLED_STYLE,
      groupId: "project-percentage",
    },
  ];
}

function App() {
  const [manHours, setManHours] = useState<ManHourRow[]>([]);
  const [projectOptions, setProjectOptions] = useState<ProjectOptionsMap>({});
  const [dropdownStates, setDropdownStates] = useState<DropdownState>({});

  const maxNumProjects = manHours.reduce(
    (max, row) => Math.max(max, row.projects.length),
    0
  );

  useEffect(() => {
    const fetchData = async () => {
      const manHoursResponse = await getManHours();
      const manHourIds = manHoursResponse.data.map((mh) => mh.id);

      const [manHoursData, projectOptionsData] = await Promise.all([
        manHoursResponse,
        getProjectOptions(manHourIds),
      ]);

      setProjectOptions(projectOptionsData.data);
      setManHours(manHoursData.data);
    };

    fetchData();
  }, []);

  function getDropdownState(rowId: string, projectIndex: number): boolean {
    return dropdownStates[rowId]?.[projectIndex] ?? false;
  }

  const getColumns = (maxNumProjects: number): Column[] => {
    const baseColumns = [
      { columnId: "employee", width: 120 },
      { columnId: "department" },
      { columnId: "position", width: 120 },
    ] satisfies Column[];

    const projectColumns = Array(maxNumProjects)
      .fill(null)
      .flatMap((_, idx) => [
        { columnId: `project-name-${idx + 1}`, width: 120 },
        { columnId: `project-function-${idx + 1}`, width: 120 },
        { columnId: `project-percentage-${idx + 1}`, width: 80 },
      ]) satisfies Column[];

    const endColumns = [
      { columnId: "assignee", width: 120 },
      { columnId: "status", width: 120 },
      { columnId: "updatedAt", width: 120 },
      { columnId: "total-percentage", width: 100 },
    ] satisfies Column[];

    return [...baseColumns, ...projectColumns, ...endColumns];
  };

  const getRows = (manHours: ManHourRow[]) => {
    return [
      getHeaderRow(maxNumProjects),
      ...manHours.map<Row>((manHour, idx) => {
        const baseCells: DefaultCellTypes[] = [
          {
            type: "text",
            text: manHour.employee,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.department,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
          {
            type: "text",
            text: manHour.position,
            nonEditable: true,
            style: NON_EDITABLE_STYLE,
          },
        ];

        const allProjectCells = Array(maxNumProjects)
          .fill(null)
          .flatMap((_, index) => {
            if (index < manHour.projects.length) {
              return createProjectCells({
                project: manHour.projects[index],
                manHourId: manHour.id,
                isOpen: getDropdownState(manHour.id, index),
                projectOptionsMap: projectOptions,
              });
            }
            return createEmptyCells();
          });

        const totalPercentage = manHour.projects.reduce(
          (sum, project) => sum + project.percentage,
          0
        );

        const totalPercentageCell: NumberCell = {
          type: "number",
          value: totalPercentage / 100,
          format: PERCENTAGE_FORMAT,
          nonEditable: true,
          style: {
            background: totalPercentage === 100 ? "#f0fff0" : "#fff0f0",
            color: totalPercentage === 100 ? "#006400" : "#ff0000",
          } as CellStyle,
        };

        const endCells: DefaultCellTypes[] = [
          { type: "text", text: manHour.assignee },
          { type: "text", text: manHour.status },
          { type: "text", text: manHour.updatedAt },
          totalPercentageCell,
        ];

        return {
          rowId: idx,
          height: 35,
          cells: [...baseCells, ...allProjectCells, ...endCells],
        };
      }),
    ];
  };

  function applyChangesToManHours(
    changes: CellChange[],
    prevManHours: ManHourRow[]
  ): ManHourRow[] {
    const newManHours = [...prevManHours];

    for (const change of changes) {
      if (typeof change.rowId !== "number") {
        throw new Error("Invalid rowId, expected roleId to be idx of manHours");
      }
      if (typeof change.columnId !== "string") {
        throw new Error("Invalid columnId, expected columnId to be string");
      }

      if (!change.columnId.startsWith("project")) {
        return prevManHours;
      }

      const data = newManHours[change.rowId];
      const columnId = change.columnId;

      const projectColIdParts = columnId.split("-");
      const [_, field, indexStr] = projectColIdParts;
      const projectIndex = parseInt(indexStr) - 1;

      if (projectIndex < 0 || projectIndex >= data.projects.length) {
        console.warn("Invalid project index: ", projectIndex);
        return prevManHours;
      }

      switch (change.type) {
        case "text": {
          if (projectColIdParts.length !== 3) {
            throw new Error(
              `Invalid project columnId, expected format: project-function-1, got ${columnId}`
            );
          }

          const options = projectOptions[data.id] || [];
          const selectedProject = options.find(
            (option: ProjectOption) =>
              option.id === data.projects[projectIndex].projectId
          );

          if (selectedProject && isStringKey(field, selectedProject)) {
            selectedProject[field] = change.newCell.text;
          }
          break;
        }

        case "dropdown": {
          setDropdownStates((prev) => {
            const newState = { ...prev };
            if (!newState[data.id]) {
              newState[data.id] = {};
            }
            newState[data.id][projectIndex] = Boolean(change.newCell.isOpen);
            return newState;
          });

          if (
            change.newCell.selectedValue &&
            change.newCell.selectedValue !== change.previousCell.selectedValue
          ) {
            data.projects[projectIndex].projectId =
              change.newCell.selectedValue;
          }
          break;
        }

        case "number": {
          console.log("change", change);
          const newValue = change.newCell.value;
          if (typeof newValue === "number" && !isNaN(newValue)) {
            const percentageValue = Math.round(newValue * 100);

            if (percentageValue >= 0 && percentageValue <= 100) {
              data.projects[projectIndex].percentage = percentageValue;

              const totalPercentage = data.projects.reduce(
                (sum, project) => sum + project.percentage,
                0
              );

              if (totalPercentage > 100) {
                console.warn(
                  `Total percentage exceeds 100% for employee ${data.employee}`
                );
              }
            } else {
              console.warn(
                `Invalid percentage value: ${percentageValue}%. Must be between 0 and 100`
              );
              // Revert to previous value
              return prevManHours;
            }
          }
          break;
        }
      }
    }

    return newManHours;
  }
  type StringKeys<T extends object> = {
    [K in keyof T]: T[K] extends string ? K : never;
  }[keyof T];

  function isStringKey<T extends object>(
    key: PropertyKey,
    obj: T
  ): key is StringKeys<T> {
    return key in obj && typeof (obj as any)[key] === "string";
  }

  function handleChanges(changes: CellChange[]) {
    setManHours((prev) => applyChangesToManHours(changes, prev));
  }

  const rows = getRows(manHours);
  console.log(rows);
  const columns = getColumns(maxNumProjects);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactGrid
        rows={rows}
        columns={columns}
        stickyTopRows={1}
        stickyLeftColumns={3}
        stickyRightColumns={1}
        onCellsChanged={handleChanges}
        enableFillHandle
        enableRowSelection
        enableRangeSelection
        enableColumnSelection
      />
    </div>
  );
}

export default App;
