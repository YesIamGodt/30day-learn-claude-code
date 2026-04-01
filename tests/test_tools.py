"""tests/test_tools.py"""
import pytest
from src.day_05.tools.bash import BashTool
from src.day_05.tools.file_read import FileReadTool

@pytest.mark.asyncio
async def test_bash_tool():
    tool = BashTool()
    result = await tool.execute("echo 'hello'")
    assert "hello" in result

@pytest.mark.asyncio
async def test_file_read_tool(tmp_path):
    tool = FileReadTool()
    test_file = tmp_path / "test.txt"
    test_file.write_text("Hello, Test!")
    result = await tool.execute(str(test_file))
    assert result == "Hello, Test!"
