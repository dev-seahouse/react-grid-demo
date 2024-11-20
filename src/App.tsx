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
  options: ProjectOption[];
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

const getManHours = async (): Promise<{ data: ManHourRow[] }> => {
  const allProjectOptions: ProjectOption[] = [
    {
      id: "general",
      name: "综合项目",
      function: "研发",
    },
    {
      id: "userGrowth",
      name: "用户增长",
      function: "运维",
    },
    {
      id: "manHourManagement",
      name: "工时管理",
      function: "研发",
    },
  ];

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
            options: allProjectOptions,
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            options: allProjectOptions,
            percentage: 40,
          },
          {
            projectId: "manHourManagement",
            options: allProjectOptions,
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
            options: allProjectOptions,
            percentage: 30,
          },
          {
            projectId: "userGrowth",
            options: allProjectOptions,
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
            options: allProjectOptions,
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
      backgroundColor: `hsl(${(i * 120) % 360}, 70%, 90%)`,
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
    { type: "header", text: "更新时间" }
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

// Update the DropdownState interface to match the example
interface DropdownState {
  [rowId: string]: {
    [projectIndex: string]: boolean;
  };
}

// Add the departments constant for reference
export const departments = [
  "效率工程——产品&测试——产品经理",
  "效率工程——服务端",
  "效率工程——前端",
  "效率工程——测试",
  "效率工程——运维",
  "效率工程——架构",
];

// Add this constant at the top level with other constants
const DISABLED_STYLE = {
  backgroundColor: "#f5f5f5",
  color: "#999",
  borderColor: "#e0e0e0",
} as const;

const NON_EDITABLE_STYLE = {
  backgroundColor: "#fafafa",
  color: "#666",
} as const;

// Helper function to create project cells with fixed options
interface CreateProjectCellsParams {
  project: Project;
  isOpen: boolean;
}

function createProjectCells({
  project,
  isOpen,
}: CreateProjectCellsParams): [DropdownCell, TextCell, NumberCell] {
  const selectedOption = project.options.find(
    (p) => p.id === project.projectId
  );

  return [
    {
      type: "dropdown",
      selectedValue: project.projectId ?? "",
      values: project.options.map((option) => ({
        value: option.id,
        label: option.name,
      })),
      isOpen,
    },
    {
      type: "text",
      text: selectedOption?.function ?? "",
      nonEditable: true,
      style: NON_EDITABLE_STYLE,
    },
    {
      type: "number",
      value: project.percentage / 100,
      format: PERCENTAGE_FORMAT,
      nanToZero: true,
    },
  ];
}

// Helper function to create disabled cells
function createEmptyCells(): [DropdownCell, TextCell, NumberCell] {
  return [
    {
      type: "dropdown",
      values: [],
      selectedValue: "",
      isOpen: false,
      isDisabled: true,
      style: DISABLED_STYLE,
    },
    {
      type: "text",
      text: "-",
      nonEditable: true,
      style: DISABLED_STYLE,
    },
    {
      type: "number",
      value: 0,
      format: PERCENTAGE_FORMAT,
      nonEditable: true,
      style: DISABLED_STYLE,
    },
  ];
}

function App() {
  const [manHours, setManHours] = useState<ManHourRow[]>([]);
  const [dropdownStates, setDropdownStates] = useState<DropdownState>({});

  const maxNumProjects = manHours.reduce(
    (max, row) => Math.max(max, row.projects.length),
    0
  );

  useEffect(() => {
    getManHours().then((res) => {
      setManHours(res.data);
    });
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
                isOpen: getDropdownState(manHour.id, index),
              });
            }
            return createEmptyCells();
          });

        const endCells: DefaultCellTypes[] = [
          { type: "text", text: manHour.assignee },
          { type: "text", text: manHour.status },
          { type: "text", text: manHour.updatedAt },
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

      if (change.type === "text") {
        if (projectColIdParts.length !== 3) {
          throw new Error(
            `Invalid project columnId, expected format: project-function-1, got ${columnId}`
          );
        }

        const selectedProject = data.projects[projectIndex].options.find(
          (p) => p.id === data.projects[projectIndex].projectId
        );

        if (selectedProject && isStringKey(field, selectedProject)) {
          selectedProject[field] = change.newCell.text;
        }
      }

      if (change.type === "dropdown") {
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
          data.projects[projectIndex].projectId = change.newCell.selectedValue;
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
        onCellsChanged={handleChanges}
        enableFillHandle
        enableRowSelection
        enableColumnSelection
      />
    </div>
  );
}

export default App;
