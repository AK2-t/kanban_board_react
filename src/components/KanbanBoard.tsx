import React from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { useBoard } from '../context/BoardContext';
import Column from './Column';
import AddColumn from './AddColumn';
import { useTheme } from '../context/ThemeContext';
import { Box } from '@mui/material';

const KanbanBoard: React.FC = () => {
  const { darkMode } = useTheme();
  const { data, currentBoardId, moveTask, moveColumn } = useBoard();

  if (!currentBoardId) return null;
  
  const board = data.boards[currentBoardId];
  if (!board) return null;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Column was dragged
    if (type === 'column') {
      moveColumn(currentBoardId, source.index, destination.index);
      return;
    }

    // Task was dragged
    moveTask(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        height: 'calc(100vh - 220px)', 
        overflowX: 'auto',
        paddingBottom: 1,
        backgroundColor: darkMode ? '#222' : '#f5f5f5',
        transition: 'background-color 0.3s ease'
      }}
    >
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{ display: 'flex', alignItems: 'flex-start' }}
            >
              {board.columnOrder.map((columnId, index) => {
                const column = board.columns[columnId];
                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(task => task !== undefined);

                return (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={tasks}
                    index={index}
                    boardId={currentBoardId}
                  />
                );
              })}
              {provided.placeholder}
              <AddColumn boardId={currentBoardId} />
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default KanbanBoard;