import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppData, Board, Task, Column, CustomLabel } from '../types';

type BoardContextType = {
  data: AppData;
  currentBoardId: string | null;
  labels: CustomLabel[];
  addBoard: (title: string) => void;
  updateBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  switchBoard: (boardId: string) => void;
  addColumn: (boardId: string, title: string) => void;
  updateColumn: (boardId: string, columnId: string, title: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  addTask: (columnId: string, task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => void;
  moveColumn: (boardId: string, sourceIndex: number, destinationIndex: number) => void;
  addLabel: (name: string, color: string) => void;
  updateLabel: (labelId: string, name: string, color: string) => void;
  deleteLabel: (labelId: string) => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
};

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

const initialLabels: CustomLabel[] = [
  { id: uuidv4(), name: '機能', color: '#61bd4f' },
  { id: uuidv4(), name: 'バグ', color: '#f2d600' },
  { id: uuidv4(), name: '調査', color: '#ff9f1a' },
  { id: uuidv4(), name: '改善', color: '#eb5a46' },
];

const createDefaultBoard = (): Board => {
  const todoId = uuidv4();
  const inProgressId = uuidv4();
  const doneId = uuidv4();

  return {
    id: uuidv4(),
    title: 'メインボード',
    columns: {
      [todoId]: {
        id: todoId,
        title: '未着手',
        taskIds: [],
      },
      [inProgressId]: {
        id: inProgressId,
        title: '進行中',
        taskIds: [],
      },
      [doneId]: {
        id: doneId,
        title: '完了',
        taskIds: [],
      },
    },
    columnOrder: [todoId, inProgressId, doneId],
  };
};

const initialBoard = createDefaultBoard();

const initialData: AppData = {
  tasks: {},
  boards: {
    [initialBoard.id]: initialBoard,
  },
  boardOrder: [initialBoard.id],
};

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const [data, setData] = useState<AppData>(() => {
    const savedData = localStorage.getItem('kanbanData');
    return savedData ? JSON.parse(savedData) : initialData;
  });

  const [currentBoardId, setCurrentBoardId] = useState<string | null>(() => {
    return data.boardOrder.length > 0 ? data.boardOrder[0] : null;
  });

  const [labels, setLabels] = useState<CustomLabel[]>(() => {
    const savedLabels = localStorage.getItem('kanbanLabels');
    return savedLabels ? JSON.parse(savedLabels) : initialLabels;
  });

  useEffect(() => {
    localStorage.setItem('kanbanData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('kanbanLabels', JSON.stringify(labels));
  }, [labels]);

  const addBoard = (title: string) => {
    const newBoard = {
      ...createDefaultBoard(),
      id: uuidv4(),
      title,
    };

    setData((prevData) => {
      const newData = {
        ...prevData,
        boards: {
          ...prevData.boards,
          [newBoard.id]: newBoard,
        },
        boardOrder: [...prevData.boardOrder, newBoard.id],
      };
      return newData;
    });

    if (!currentBoardId) {
      setCurrentBoardId(newBoard.id);
    }
  };

  const updateBoard = (boardId: string, title: string) => {
    setData((prevData) => {
      const board = prevData.boards[boardId];
      if (!board) return prevData;

      const updatedBoard = {
        ...board,
        title,
      };

      return {
        ...prevData,
        boards: {
          ...prevData.boards,
          [boardId]: updatedBoard,
        },
      };
    });
  };

  const deleteBoard = (boardId: string) => {
    setData((prevData) => {
      const { [boardId]: deletedBoard, ...remainingBoards } = prevData.boards;
      
      // Remove all tasks associated with this board
      const boardColumns = deletedBoard.columnOrder;
      const taskIdsToRemove: string[] = [];
      
      boardColumns.forEach(columnId => {
        const column = deletedBoard.columns[columnId];
        if (column) {
          taskIdsToRemove.push(...column.taskIds);
        }
      });
      
      const newTasks = { ...prevData.tasks };
      taskIdsToRemove.forEach(taskId => {
        delete newTasks[taskId];
      });

      const newBoardOrder = prevData.boardOrder.filter(id => id !== boardId);
      
      const newData = {
        tasks: newTasks,
        boards: remainingBoards,
        boardOrder: newBoardOrder,
      };
      
      // Update current board ID if necessary
      if (currentBoardId === boardId) {
        setCurrentBoardId(newBoardOrder.length > 0 ? newBoardOrder[0] : null);
      }
      
      return newData;
    });
  };

  const switchBoard = (boardId: string) => {
    if (data.boards[boardId]) {
      setCurrentBoardId(boardId);
    }
  };

  const addColumn = (boardId: string, title: string) => {
    const newColumnId = uuidv4();
    
    setData((prevData) => {
      const board = prevData.boards[boardId];
      if (!board) return prevData;

      const newColumn: Column = {
        id: newColumnId,
        title,
        taskIds: [],
      };

      const updatedBoard = {
        ...board,
        columns: {
          ...board.columns,
          [newColumnId]: newColumn,
        },
        columnOrder: [...board.columnOrder, newColumnId],
      };

      return {
        ...prevData,
        boards: {
          ...prevData.boards,
          [boardId]: updatedBoard,
        },
      };
    });
  };

  const updateColumn = (boardId: string, columnId: string, title: string) => {
    setData((prevData) => {
      const board = prevData.boards[boardId];
      if (!board) return prevData;

      const column = board.columns[columnId];
      if (!column) return prevData;

      const updatedColumn = {
        ...column,
        title,
      };

      const updatedBoard = {
        ...board,
        columns: {
          ...board.columns,
          [columnId]: updatedColumn,
        },
      };

      return {
        ...prevData,
        boards: {
          ...prevData.boards,
          [boardId]: updatedBoard,
        },
      };
    });
  };

  const deleteColumn = (boardId: string, columnId: string) => {
    setData((prevData) => {
      const board = prevData.boards[boardId];
      if (!board) return prevData;

      const column = board.columns[columnId];
      if (!column) return prevData;

      // Remove all tasks in this column
      const taskIdsToRemove = column.taskIds;
      const newTasks = { ...prevData.tasks };
      taskIdsToRemove.forEach(taskId => {
        delete newTasks[taskId];
      });

      // Create new columns object without the deleted column
      const { [columnId]: deletedColumn, ...remainingColumns } = board.columns;

      const updatedBoard = {
        ...board,
        columns: remainingColumns,
        columnOrder: board.columnOrder.filter(id => id !== columnId),
      };

      return {
        ...prevData,
        tasks: newTasks,
        boards: {
          ...prevData.boards,
          [boardId]: updatedBoard,
        },
      };
    });
  };

  const addTask = (columnId: string, task: Omit<Task, 'id' | 'columnId' | 'createdAt'>) => {
    const newTaskId = uuidv4();
    
    setData((prevData) => {
      // Find which board has this column
      let targetBoardId: string | null = null;
      let targetBoard: Board | null = null;
      
      for (const boardId of prevData.boardOrder) {
        const board = prevData.boards[boardId];
        if (board.columns[columnId]) {
          targetBoardId = boardId;
          targetBoard = board;
          break;
        }
      }
      
      if (!targetBoardId || !targetBoard) return prevData;
      
      const column = targetBoard.columns[columnId];
      if (!column) return prevData;
      
      const newTask: Task = {
        id: newTaskId,
        columnId,
        createdAt: Date.now(),
        ...task,
      };
      
      const updatedColumn = {
        ...column,
        taskIds: [...column.taskIds, newTaskId],
      };
      
      const updatedBoard = {
        ...targetBoard,
        columns: {
          ...targetBoard.columns,
          [columnId]: updatedColumn,
        },
      };
      
      return {
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [newTaskId]: newTask,
        },
        boards: {
          ...prevData.boards,
          [targetBoardId]: updatedBoard,
        },
      };
    });
  };

  const updateTask = (taskId: string, updatedTask: Partial<Task>) => {
    setData((prevData) => {
      const task = prevData.tasks[taskId];
      if (!task) return prevData;

      const newTask = {
        ...task,
        ...updatedTask,
      };

      return {
        ...prevData,
        tasks: {
          ...prevData.tasks,
          [taskId]: newTask,
        },
      };
    });
  };

  const deleteTask = (taskId: string) => {
    setData((prevData) => {
      const task = prevData.tasks[taskId];
      if (!task) return prevData;

      const { columnId } = task;
      
      // Find the board that contains this column
      let targetBoardId: string | null = null;
      let targetBoard: Board | null = null;
      
      for (const boardId of prevData.boardOrder) {
        const board = prevData.boards[boardId];
        if (board.columns[columnId]) {
          targetBoardId = boardId;
          targetBoard = board;
          break;
        }
      }
      
      if (!targetBoardId || !targetBoard) return prevData;
      
      const column = targetBoard.columns[columnId];
      if (!column) return prevData;
      
      const updatedColumn = {
        ...column,
        taskIds: column.taskIds.filter(id => id !== taskId),
      };
      
      const updatedBoard = {
        ...targetBoard,
        columns: {
          ...targetBoard.columns,
          [columnId]: updatedColumn,
        },
      };
      
      const { [taskId]: deletedTask, ...remainingTasks } = prevData.tasks;
      
      return {
        ...prevData,
        tasks: remainingTasks,
        boards: {
          ...prevData.boards,
          [targetBoardId]: updatedBoard,
        },
      };
    });
  };

  const moveTask = (taskId: string, sourceColumnId: string, destinationColumnId: string, sourceIndex: number, destinationIndex: number) => {
    setData((prevData) => {
      // Find which board has these columns
      let targetBoardId: string | null = null;
      let targetBoard: Board | null = null;
      
      for (const boardId of prevData.boardOrder) {
        const board = prevData.boards[boardId];
        if (board.columns[sourceColumnId] && board.columns[destinationColumnId]) {
          targetBoardId = boardId;
          targetBoard = board;
          break;
        }
      }
      
      if (!targetBoardId || !targetBoard) return prevData;
      
      const sourceColumn = targetBoard.columns[sourceColumnId];
      const destinationColumn = targetBoard.columns[destinationColumnId];
      
      if (!sourceColumn || !destinationColumn) return prevData;
      
      // Create new taskIds arrays
      const sourceTaskIds = Array.from(sourceColumn.taskIds);
      sourceTaskIds.splice(sourceIndex, 1);
      
      const destinationTaskIds = Array.from(
        sourceColumnId === destinationColumnId ? sourceTaskIds : destinationColumn.taskIds
      );
      destinationTaskIds.splice(destinationIndex, 0, taskId);
      
      // Create updated columns
      const updatedSourceColumn = {
        ...sourceColumn,
        taskIds: sourceTaskIds,
      };
      
      const updatedDestinationColumn = {
        ...destinationColumn,
        taskIds: destinationTaskIds,
      };
      
      // Update the task's columnId if it's moving to a different column
      let updatedTasks = prevData.tasks;
      if (sourceColumnId !== destinationColumnId) {
        updatedTasks = {
          ...prevData.tasks,
          [taskId]: {
            ...prevData.tasks[taskId],
            columnId: destinationColumnId,
          },
        };
      }
      
      // Create updated board with new columns
      const updatedColumns = {
        ...targetBoard.columns,
        [sourceColumnId]: updatedSourceColumn,
        [destinationColumnId]: updatedDestinationColumn,
      };
      
      const updatedBoard = {
        ...targetBoard,
        columns: updatedColumns,
      };
      
      return {
        ...prevData,
        tasks: updatedTasks,
        boards: {
          ...prevData.boards,
          [targetBoardId]: updatedBoard,
        },
      };
    });
  };

  const moveColumn = (boardId: string, sourceIndex: number, destinationIndex: number) => {
    setData((prevData) => {
      const board = prevData.boards[boardId];
      if (!board) return prevData;
      
      const newColumnOrder = Array.from(board.columnOrder);
      const [removed] = newColumnOrder.splice(sourceIndex, 1);
      newColumnOrder.splice(destinationIndex, 0, removed);
      
      const updatedBoard = {
        ...board,
        columnOrder: newColumnOrder,
      };
      
      return {
        ...prevData,
        boards: {
          ...prevData.boards,
          [boardId]: updatedBoard,
        },
      };
    });
  };

  const addLabel = (name: string, color: string) => {
    const newLabel: CustomLabel = {
      id: uuidv4(),
      name,
      color,
    };
    
    setLabels((prevLabels) => [...prevLabels, newLabel]);
  };

  const updateLabel = (labelId: string, name: string, color: string) => {
    setLabels((prevLabels) =>
      prevLabels.map((label) =>
        label.id === labelId ? { ...label, name, color } : label
      )
    );
  };

  const deleteLabel = (labelId: string) => {
    setLabels((prevLabels) => prevLabels.filter((label) => label.id !== labelId));
    
    // Remove this label from all tasks
    setData((prevData) => {
      const updatedTasks = { ...prevData.tasks };
      
      Object.keys(updatedTasks).forEach((taskId) => {
        const task = updatedTasks[taskId];
        if (task.labels.includes(labelId)) {
          updatedTasks[taskId] = {
            ...task,
            labels: task.labels.filter((id) => id !== labelId),
          };
        }
      });
      
      return {
        ...prevData,
        tasks: updatedTasks,
      };
    });
  };

  const exportData = () => {
    const exportData = {
      data,
      labels,
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const importedData = JSON.parse(jsonData);
      if (importedData.data && importedData.labels) {
        setData(importedData.data);
        setLabels(importedData.labels);
        
        // Set current board to the first board
        if (importedData.data.boardOrder.length > 0) {
          setCurrentBoardId(importedData.data.boardOrder[0]);
        }
      }
    } catch (error) {
      console.error('Invalid JSON data for import', error);
      alert('インポートに失敗しました。データ形式が無効です。');
    }
  };

  const value = {
    data,
    currentBoardId,
    labels,
    addBoard,
    updateBoard,
    deleteBoard,
    switchBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    moveColumn,
    addLabel,
    updateLabel,
    deleteLabel,
    exportData,
    importData,
  };

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};
